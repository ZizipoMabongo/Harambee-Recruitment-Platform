import { connect } from './db';
import Article from '@/models/Article';

// Keyword + category search over published articles (used by pages and the API).
export async function searchArticles({ q, category, limit = 50 } = {}) {
  await connect();
  const filter = { status: 'published' };
  if (category) filter.category = category;
  let query;
  if (q) {
    filter.$text = { $search: q };
    query = Article.find(filter, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  } else {
    query = Article.find(filter).sort({ createdAt: -1 });
  }
  const rows = await query.limit(limit).lean();
  return rows.map((a) => ({
    id: String(a._id), title: a.title, slug: a.slug, category: a.category,
    date: a.updatedAt ? new Date(a.updatedAt).toISOString().slice(0, 10) : '',
  }));
}
