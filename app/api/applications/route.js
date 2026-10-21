import { connect } from '@/lib/db';
import Job from '@/models/Job';
import Application from '@/models/Application';
import { guard, json } from '@/lib/auth';

// Candidates see their own applications; recruiters see applicants to their jobs; admins see all.
export async function GET() {
  const { user, err } = await guard();
  if (err) return err;
  await connect();
  let filter = {};
  if (user.role === 'candidate') filter = { candidate: user.id };
  else if (user.role === 'recruiter') filter = { job: { $in: await Job.find({ recruiter: user.id }).distinct('_id') } };
  const rows = await Application.find(filter).sort({ createdAt: -1 }).populate('job', 'title company').populate('candidate', 'name email').lean();
  const staff = user.role !== 'candidate';
  return json({ applications: rows.map((a) => ({
    id: String(a._id), status: a.status,
    ...(staff && { matchScore: a.matchScore, matchLabel: a.matchLabel }),
    job: a.job && { title: a.job.title, company: a.job.company },
    candidate: a.candidate && { id: String(a.candidate._id), name: a.candidate.name, email: a.candidate.email },
  })) });
}
