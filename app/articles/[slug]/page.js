import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connect } from '@/lib/db';
import Article from '@/models/Article';
import { catName } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }) {
  await connect();
  const a = await Article.findOneAndUpdate({ slug: params.slug, status: 'published' }, { $inc: { views: 1 } }, { new: true }).lean();
  if (!a) notFound();
  return (
    <article className="card">
      <p className="meta"><Link href="/articles">Help centre</Link> / <Link href={`/articles?category=${a.category}`}>{catName(a.category)}</Link></p>
      <h1>{a.title}</h1>
      <p className="meta">Updated {new Date(a.updatedAt).toISOString().slice(0, 10)} · {a.views} views</p>
      <p className="body">{a.body}</p>
    </article>
  );
}
