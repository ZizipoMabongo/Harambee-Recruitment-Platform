import { connect } from '@/lib/db';
import Article from '@/models/Article';
import { CATEGORIES } from '@/lib/categories';
import { searchArticles } from '@/lib/data';
import { getUser, guard, json } from '@/lib/auth';

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const user = await getUser();
  // ?all=1 lists drafts too, but only for the people who manage articles
  if (sp.get('all') && user && user.role !== 'candidate') {
    await connect();
    const filter = user.role === 'admin' ? {} : { $or: [{ status: 'published' }, { author: user.id }] };
    const rows = await Article.find(filter).sort({ updatedAt: -1 }).lean();
    return json({ articles: rows.map((a) => ({ ...a, id: String(a._id), author: String(a.author) })) });
  }
  return json({ articles: await searchArticles({ q: sp.get('q'), category: sp.get('category') }) });
}

export async function POST(req) {
  const { user, err } = await guard(['recruiter', 'admin']);
  if (err) return err;
  const { title, body, category, status } = await req.json().catch(() => ({}));
  if (!title?.trim() || !body?.trim() || !CATEGORIES.some((c) => c.id === category)) return json({ error: 'Title, text and a valid category are required.' }, 400);
  await connect();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) + '-' + Date.now().toString(36).slice(-4);
  // Recruiters can only create drafts; an administrator publishes them.
  const art = await Article.create({ title, body, category, slug, author: user.id, status: user.role === 'admin' && status === 'published' ? 'published' : 'draft' });
  return json({ article: { id: String(art._id), slug } }, 201);
}
