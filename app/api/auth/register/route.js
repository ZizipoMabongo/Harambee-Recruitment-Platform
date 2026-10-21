import bcrypt from 'bcryptjs';
import { connect } from '@/lib/db';
import User from '@/models/User';
import { json, signToken, setSession } from '@/lib/auth';

export async function POST(req) {
  const { name, email, password, role } = await req.json().catch(() => ({}));
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '')) return json({ error: 'Enter your name and a valid email.' }, 400);
  if (!password || password.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400);
  await connect();
  if (await User.findOne({ email: email.toLowerCase() })) return json({ error: 'That email is already registered.' }, 409);
  // Admins are never self-registered. Recruiter sign-up should be approved in a real deployment.
  const safeRole = role === 'recruiter' ? 'recruiter' : 'candidate';
  const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: safeRole });
  setSession(await signToken(user));
  return json({ ok: true, role: user.role });
}
