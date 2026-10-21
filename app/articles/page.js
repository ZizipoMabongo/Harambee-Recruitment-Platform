import Link from 'next/link';
import { CATEGORIES, catName } from '@/lib/categories';
import { searchArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function Articles({ searchParams }) {
  const q = (searchParams.q || '').trim();
  const category = searchParams.category || '';
  const results = await searchArticles({ q, category });
  const link = (c) => `/articles?${new URLSearchParams({ ...(q && { q }), ...(c && { category: c }) })}`;
  return (
    <>
      <section className="hero">
        <h1>{q ? `Results for “${q}”` : 'Help articles'}</h1>
        <form action="/articles" className="search">
          <input name="q" defaultValue={q} aria-label="Search articles" />
          {category && <input type="hidden" name="category" value={category} />}
          <button className="btn">Search</button>
        </form>
        <div className="chips">
          <Link href={link('')} className="chip" aria-current={!category}>All</Link>
          {CATEGORIES.map((c) => <Link key={c.id} href={link(c.id)} className="chip" aria-current={category === c.id}>{c.name}</Link>)}
        </div>
      </section>
      <p className="meta">{results.length} article{results.length === 1 ? '' : 's'} found</p>
      <div className="list">
        {results.map((a) => (
          <Link key={a.id} href={`/articles/${a.slug}`} className="item"><b>{a.title}</b><span className="meta">{catName(a.category)} · updated {a.date}</span></Link>
        ))}
        {!results.length && <p className="note">No articles match. Try a shorter keyword or choose All.</p>}
      </div>
    </>
  );
}
