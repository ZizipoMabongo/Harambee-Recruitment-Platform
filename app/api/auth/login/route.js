import bcrypt from 'bcryptjs';
import { connect } from '@/lib/db';
import User from '@/models/User';
import { json, signToken, setSession } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  await connect();
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  // Same message for both failures so attackers cannot discover which emails exist.
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return json({ error: 'Incorrect email or password.' }, 401);
  setSession(await signToken(user));
  return json({ ok: true, role: user.role });
}
