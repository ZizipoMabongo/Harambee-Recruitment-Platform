import Notification from '@/models/Notification';
import User from '@/models/User';

// Creates an in-app notification. If RESEND_API_KEY and EMAIL_FROM are set, also sends an email (best effort).
export async function notify(userId, { title, body = '', link = '/notifications', type = 'info' }) {
  await Notification.create({ user: userId, title, body, link, type });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return;
  try {
    const u = await User.findById(userId).select('email').lean();
    if (!u) return;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: u.email, subject: title, text: `${body}\n\n${process.env.APP_URL || ''}${link}` }),
    });
  } catch { /* email is optional; never block the request */ }
}
