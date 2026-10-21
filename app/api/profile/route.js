import { connect } from '@/lib/db';
import Profile from '@/models/Profile';
import { guard, json } from '@/lib/auth';

const clean = (s, n = 200) => String(s ?? '').trim().slice(0, n);
const list = (a, n) => (Array.isArray(a) ? a.slice(0, n) : []);

export async function GET() {
  const { user, err } = await guard(['candidate']);
  if (err) return err;
  await connect();
  const profile = await Profile.findOneAndUpdate({ user: user.id }, { $setOnInsert: { user: user.id } }, { upsert: true, new: true, lean: true });
  return json({ profile });
}

export async function PUT(req) {
  const { user, err } = await guard(['candidate']);
  if (err) return err;
  const b = await req.json().catch(() => ({}));
  const set = {
    headline: clean(b.headline, 120), phone: clean(b.phone, 30), location: clean(b.location, 80), summary: clean(b.summary, 1200),
    visible: !!b.visible, openToWork: !!b.openToWork,
    skills: (Array.isArray(b.skills) ? b.skills : String(b.skills || '').split(',')).map((s) => clean(s, 40)).filter(Boolean).slice(0, 20),
    experience: list(b.experience, 10).map((e) => ({ role: clean(e.role, 80), company: clean(e.company, 80), from: clean(e.from, 20), to: clean(e.to, 20), desc: clean(e.desc, 500) })).filter((e) => e.role || e.company),
    education: list(b.education, 10).map((e) => ({ school: clean(e.school, 100), qualification: clean(e.qualification, 100), year: clean(e.year, 10) })).filter((e) => e.school || e.qualification),
  };
  await connect();
  await Profile.findOneAndUpdate({ user: user.id }, { $set: set }, { upsert: true });
  return json({ ok: true });
}
