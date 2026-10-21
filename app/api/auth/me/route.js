import { getUser, json } from '@/lib/auth';
export async function GET() { return json({ user: await getUser() }); }
