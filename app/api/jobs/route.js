import { connect } from '@/lib/db';
import Job from '@/models/Job';
import { guard, json } from '@/lib/auth';

export async function GET(req) {
  const q = new URL(req.url).searchParams.get('q');
  await connect();
  const filter = { status: 'open' };
  if (q) filter.$text = { $search: q };
  const jobs = await Job.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  return json({ jobs: jobs.map((j) => ({ ...j, id: String(j._id), recruiter: String(j.recruiter) })) });
}

export async function POST(req) {
  const { user, err } = await guard(['recruiter', 'admin']);
  if (err) return err;
  const b = await req.json().catch(() => ({}));
  const { title, company, location, description } = b;
  if (![title, company, location, description].every((v) => v?.trim())) return json({ error: 'Fill in title, company, location and description.' }, 400);
  const skills = (Array.isArray(b.skills) ? b.skills : String(b.skills || '').split(',')).map((s) => String(s).trim().slice(0, 40)).filter(Boolean).slice(0, 15);
  await connect();
  const job = await Job.create({ title, company, location, description, skills, autoShortlist: !!b.autoShortlist, recruiter: user.id });
  return json({ job: { id: String(job._id) } }, 201);
}
