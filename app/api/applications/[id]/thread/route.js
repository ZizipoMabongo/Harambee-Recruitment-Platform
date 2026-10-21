import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import Job from '@/models/Job';
import User from '@/models/User';
import Application from '@/models/Application';
import Interview from '@/models/Interview';
import Message from '@/models/Message';
import { notify } from '@/lib/notify';
import { guard, json } from '@/lib/auth';

async function context(id, user) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connect();
  const app = await Application.findById(id);
  if (!app) return null;
  const job = await Job.findById(app.job).lean();
  let who = null;
  if (user.role === 'admin' || (user.role === 'recruiter' && String(job?.recruiter) === user.id)) who = 'staff';
  else if (user.role === 'candidate' && String(app.candidate) === user.id) who = 'candidate';
  return who ? { app, job, who } : null;
}

export async function GET(_req, { params }) {
  const { user, err } = await guard();
  if (err) return err;
  const c = await context(params.id, user);
  if (!c) return json({ error: 'Application not found.' }, 404);
  const { app, job, who } = c;
  const [iv, msgs, cand] = await Promise.all([
    Interview.findOne({ application: app._id }).lean(),
    Message.find({ application: app._id }).sort({ createdAt: 1 }).populate('from', 'name').lean(),
    User.findById(app.candidate).select('name').lean(),
  ]);
  return json({
    viewer: who,
    application: { id: String(app._id), status: app.status, coverNote: app.coverNote, job: { title: job.title, company: job.company }, candidate: { id: String(app.candidate), name: cand?.name },
      ...(who === 'staff' && { matchScore: app.matchScore, matchLabel: app.matchLabel, matchNotes: app.matchNotes }) },
    interview: iv && { when: iv.scheduledAt, location: iv.location, note: iv.note, status: iv.status },
    messages: msgs.map((m) => ({ id: String(m._id), from: m.from?.name, mine: String(m.from?._id) === user.id, body: m.body, at: m.createdAt })),
  });
}

// POST { action: 'message' | 'invite' | 'respond', ... }
export async function POST(req, { params }) {
  const { user, err } = await guard();
  if (err) return err;
  const c = await context(params.id, user);
  if (!c) return json({ error: 'Application not found.' }, 404);
  const { app, job, who } = c;
  const b = await req.json().catch(() => ({}));
  const link = `/applications/${app._id}`;

  if (b.action === 'message') {
    const body = String(b.body || '').trim().slice(0, 1000);
    if (!body) return json({ error: 'Write a message first.' }, 400);
    await Message.create({ application: app._id, from: user.id, body });
    await notify(who === 'candidate' ? job.recruiter : app.candidate, { type: 'message', title: `New message about ${job.title}`, body: body.slice(0, 120), link });
    return json({ ok: true }, 201);
  }
  if (b.action === 'invite') {
    if (who !== 'staff') return json({ error: 'Only recruiters can invite candidates.' }, 403);
    const when = new Date(b.when);
    if (isNaN(when) || when < new Date()) return json({ error: 'Choose a date and time in the future.' }, 400);
    await Interview.findOneAndUpdate({ application: app._id }, { scheduledAt: when, location: String(b.location || '').slice(0, 200), note: String(b.note || '').slice(0, 500), status: 'invited' }, { upsert: true });
    if (app.status !== 'interview') { app.status = 'interview'; await app.save(); }
    await notify(app.candidate, { type: 'interview', title: `Interview invitation: ${job.title}`, body: `${when.toLocaleString('en-ZA')} ${b.location ? '· ' + String(b.location).slice(0, 80) : ''}`, link });
    return json({ ok: true }, 201);
  }
  if (b.action === 'respond') {
    if (who !== 'candidate' || !['accepted', 'declined'].includes(b.value)) return json({ error: 'Not allowed.' }, 400);
    const iv = await Interview.findOneAndUpdate({ application: app._id }, { status: b.value });
    if (!iv) return json({ error: 'No interview to respond to.' }, 404);
    await notify(job.recruiter, { type: 'interview', title: `Interview ${b.value}: ${job.title}`, link });
    return json({ ok: true });
  }
  return json({ error: 'Unknown action.' }, 400);
}
