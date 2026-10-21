import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import Job from '@/models/Job';
import Profile from '@/models/Profile';
import Document from '@/models/Document';
import Application from '@/models/Application';
import { scoreMatch, labelFor } from '@/lib/match';
import { notify } from '@/lib/notify';
import { guard, json } from '@/lib/auth';

export async function POST(req, { params }) {
  const { user, err } = await guard(['candidate']);
  if (err) return err;
  if (!mongoose.isValidObjectId(params.id)) return json({ error: 'Job not found.' }, 404);
  await connect();
  const job = await Job.findOne({ _id: params.id, status: 'open' });
  if (!job) return json({ error: 'This job is no longer open.' }, 404);
  const profile = await Profile.findOne({ user: user.id }).lean();
  const docCount = await Document.countDocuments({ owner: user.id });
  if (!profile?.headline || !(docCount || profile.experience?.length || profile.education?.length)) {
    return json({ error: 'Complete your profile first (headline plus a CV upload or your experience), then apply. Open My profile in the menu.' }, 400);
  }
  const { coverNote } = await req.json().catch(() => ({}));
  // Automated screening: score the candidate against the vacancy and label the application.
  const { score, reasons } = scoreMatch(job, profile, docCount);
  const auto = job.autoShortlist && score >= 70;
  let app;
  try {
    app = await Application.create({ job: job._id, candidate: user.id, coverNote: coverNote || '', matchScore: score, matchLabel: labelFor(score), matchNotes: reasons, status: auto ? 'shortlisted' : 'applied' });
  } catch (e) {
    if (e.code === 11000) return json({ error: 'You have already applied for this job.' }, 409);
    throw e;
  }
  await notify(job.recruiter, { type: 'application', title: `New application for ${job.title}`, body: `${user.name} scored ${score}/100${auto ? ' and was auto-shortlisted' : ''}.`, link: `/applications/${app._id}` });
  if (auto) await notify(user.id, { type: 'status', title: `You were shortlisted for ${job.title}`, link: `/applications/${app._id}` });
  return json({ ok: true, auto }, 201);
}
