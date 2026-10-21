import Link from 'next/link';
import { connect } from '@/lib/db';
import { getUser } from '@/lib/auth';
import Profile from '@/models/Profile';

export const dynamic = 'force-dynamic';

export default async function Talent({ searchParams }) {
  const me = await getUser();
  if (!me || me.role === 'candidate') return <p className="note">Only recruiters and administrators can browse talent. <Link href="/login">Log in</Link></p>;
  const q = (searchParams.q || '').trim();
  await connect();
  const filter = { visible: true };
  if (q) filter.$text = { $search: q };
  const rows = await Profile.find(filter).sort({ updatedAt: -1 }).limit(48).populate('user', 'name').lean();
  return (
    <>
      <section className="page-head"><div><h1>Talent</h1><p className="meta">Candidates who chose to be visible to recruiters.</p></div></section>
      <form action="/candidates" className="search"><input name="q" defaultValue={q} placeholder="Search by skill, job title or location" aria-label="Search talent" /><button className="btn">Search</button></form>
      <p className="meta" style={{ margin: '14px 0' }}>{rows.length} profile{rows.length === 1 ? '' : 's'}</p>
      <div className="grid3">
        {rows.filter((r) => r.user).map((r) => (
          <Link key={String(r._id)} href={`/candidates/${r.user._id}`} className="feat cand">
            <div className="avatar sm">{r.user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</div>
            <h3>{r.user.name}</h3><p className="meta">{r.headline || 'Candidate'}{r.location ? ` · ${r.location}` : ''}</p>
            <div className="chips">{(r.skills || []).slice(0, 4).map((s) => <span key={s} className="pill">{s}</span>)}</div>
          </Link>
        ))}
        {!rows.length && <p className="note">No visible profiles match yet.</p>}
      </div>
    </>
  );
}
