import { searchArticles } from '@/lib/data';
import { json } from '@/lib/auth';

// Retrieval-based help assistant: answers by finding the best matching help-centre articles.
export async function POST(req) {
  const { message } = await req.json().catch(() => ({}));
  const q = String(message || '').trim().slice(0, 200);
  if (!q) return json({ error: 'Type a question first.' }, 400);
  const rows = await searchArticles({ q, limit: 3 });
  return json({
    reply: rows.length ? 'These help articles should answer that:' : 'I could not find an article on that. Try different words, or browse the help centre.',
    sources: rows.map((r) => ({ title: r.title, slug: r.slug })),
  });
}
