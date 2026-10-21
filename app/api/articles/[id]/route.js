import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import Article from '@/models/Article';
import { CATEGORIES } from '@/lib/categories';
import { guard, json } from '@/lib/auth';

async function load(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connect();
  return Article.findById(id);
}

export async function PUT(req, { params }) {
  const { user, err } = await guard(['recruiter', 'admin']);
  if (err) return err;
  const art = await load(params.id);
  if (!art) return json({ error: 'Article not found.' }, 404);
  if (user.role !== 'admin' && String(art.author) !== user.id) return json({ error: 'You can only edit your own articles.' }, 403);
  const { title, body, category, status } = await req.json().catch(() => ({}));
  if (title?.trim()) art.title = title;
  if (body?.trim()) art.body = body;
  if (CATEGORIES.some((c) => c.id === category)) art.category = category;
  if (user.role === 'admin' && ['draft', 'published'].includes(status)) art.status = status;
  await art.save();
  return json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { err } = await guard(['admin']);
  if (err) return err;
  const art = await load(params.id);
  if (!art) return json({ error: 'Article not found.' }, 404);
  await art.deleteOne();
  return json({ ok: true });
}
