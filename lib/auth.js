import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = () => new TextEncoder().encode(process.env.JWT_SECRET);

export const json = (data, status = 200) => Response.json(data, { status });

export async function signToken(u) {
  return new SignJWT({ role: u.role, name: u.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(u._id))
    .setExpirationTime('7d')
    .sign(key());
}

export function setSession(token) {
  cookies().set('token', token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getUser() {
  const t = cookies().get('token')?.value;
  if (!t || !process.env.JWT_SECRET) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    return { id: payload.sub, role: payload.role, name: payload.name };
  } catch { return null; }
}

// Server-side role check for API routes: const { user, err } = await guard(['admin'])
export async function guard(roles) {
  const user = await getUser();
  if (!user) return { err: json({ error: 'Please log in.' }, 401) };
  if (roles && !roles.includes(user.role)) return { err: json({ error: 'You do not have permission to do this.' }, 403) };
  return { user };
}
