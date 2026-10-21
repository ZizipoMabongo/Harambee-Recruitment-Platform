import { NextResponse } from 'next/server';
export async function POST(req) {
  const res = NextResponse.redirect(new URL('/', req.url), 303);
  res.cookies.delete('token');
  return res;
}
