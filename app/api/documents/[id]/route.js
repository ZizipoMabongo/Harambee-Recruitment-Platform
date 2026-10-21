import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import Document from '@/models/Document';
import Profile from '@/models/Profile';
import { canViewProfile } from '@/lib/access';
import { guard, json } from '@/lib/auth';

async function load(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connect();
  return Document.findById(id);
}

export async function GET(_req, { params }) {
  const { user, err } = await guard();
  if (err) return err;
  const doc = await load(params.id);
  if (!doc) return json({ error: 'Document not found.' }, 404);
  const profile = await Profile.findOne({ user: doc.owner }).lean();
  const allowed = String(doc.owner) === user.id || user.role === 'admin' || (await canViewProfile(user, profile));
  if (!allowed) return json({ error: 'You do not have permission to view this document.' }, 403);
  return new Response(doc.data, { headers: {
    'Content-Type': doc.mime,
    'Content-Disposition': `${doc.mime === 'application/pdf' ? 'inline' : 'attachment'}; filename="${doc.name}"`,
    'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store',
  } });
}

export async function DELETE(_req, { params }) {
  const { user, err } = await guard(['candidate']);
  if (err) return err;
  const doc = await load(params.id);
  if (!doc || String(doc.owner) !== user.id) return json({ error: 'Document not found.' }, 404);
  await doc.deleteOne();
  return json({ ok: true });
}
