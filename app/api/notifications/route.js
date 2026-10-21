import { connect } from '@/lib/db';
import Notification from '@/models/Notification';
import { guard, json } from '@/lib/auth';

export async function GET() {
  const { user, err } = await guard();
  if (err) return err;
  await connect();
  const rows = await Notification.find({ user: user.id }).sort({ createdAt: -1 }).limit(50).lean();
  return json({ notifications: rows.map((n) => ({ id: String(n._id), title: n.title, body: n.body, link: n.link, read: n.read, at: n.createdAt })) });
}

// Mark everything as read
export async function POST() {
  const { user, err } = await guard();
  if (err) return err;
  await connect();
  await Notification.updateMany({ user: user.id, read: false }, { read: true });
  return json({ ok: true });
}
