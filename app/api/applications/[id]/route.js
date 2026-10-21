import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { notify } from '@/lib/notify';
import { guard, json } from '@/lib/auth';

// Recruiter moves an application through the pipeline; the candidate is notified.
export async function PATCH(req, { params }) {
  const { user, err } = await guard(['recruiter', 'admin']);
  if (err) return err;
  const { status } = await req.json().catch(() => ({}));
  if (!['applied', 'shortlisted', 'interview', 'offer', 'rejected'].includes(status)) return json({ error: 'Invalid status.' }, 400);
  if (!mongoose.isValidObjectId(params.id)) return json({ error: 'Not found.' }, 404);
  await connect();
  const app = await Application.findById(params.id);
  if (!app) return json({ error: 'Not found.' }, 404);
  const job = await Job.findById(app.job);
  if (user.role !== 'admin' && String(job?.recruiter) !== user.id) return json({ error: 'This is not your vacancy.' }, 403);
  if (app.status !== status) {
    app.status = status;
    await app.save();
    await notify(app.candidate, { type: 'status', title: `Your application for ${job.title} is now: ${status}`, link: `/applications/${app._id}` });
  }
  return json({ ok: true });
}
