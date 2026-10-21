import { connect } from '@/lib/db';
import Document from '@/models/Document';
import { guard, json } from '@/lib/auth';

const MAX = 4 * 1024 * 1024; // Vercel functions accept request bodies up to about 4.5 MB
const KINDS = ['cv', 'certificate', 'id', 'other'];

export async function GET() {
  const { user, err } = await guard(['candidate']);
  if (err) return err;
  await connect();
  const docs = await Document.find({ owner: user.id }).select('-data').sort({ createdAt: -1 }).lean();
  return json({ documents: docs.map((d) => ({ id: String(d._id), name: d.name, kind: d.kind, size: d.size })) });
}

export async function POST(req) {
  const { user, err } = await guard(['candidate']);
  if (err) return err;
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return json({ error: 'Choose a file to upload.' }, 400);
  if (file.size > MAX) return json({ error: 'File is too large. The limit is 4 MB.' }, 413);
  const buf = Buffer.from(await file.arrayBuffer());
  // Check the real file signature, not just the name the browser reports.
  const isPdf = buf.subarray(0, 4).toString() === '%PDF';
  const isDocx = buf[0] === 0x50 && buf[1] === 0x4b && /\.docx$/i.test(file.name);
  if (!isPdf && !isDocx) return json({ error: 'Only PDF or Word (.docx) files are allowed.' }, 400);
  await connect();
  if ((await Document.countDocuments({ owner: user.id })) >= 10) return json({ error: 'You can store up to 10 documents. Delete one first.' }, 400);
  const kind = KINDS.includes(form.get('kind')) ? form.get('kind') : 'other';
  const doc = await Document.create({
    owner: user.id, kind, size: buf.length, data: buf,
    name: file.name.replace(/[^\w.\- ]/g, '_').slice(0, 100),
    mime: isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  return json({ id: String(doc._id) }, 201);
}
