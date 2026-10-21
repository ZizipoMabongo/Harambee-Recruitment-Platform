import Link from 'next/link';
import mongoose from 'mongoose';
import { connect } from '@/lib/db';
import { getUser } from '@/lib/auth';
import User from '@/models/User';
import Job from '@/models/Job';
import Profile from '@/models/Profile';
import Document from '@/models/Document';
import Article from '@/models/Article';
import Application from '@/models/Application';

export const dynamic = 'force-dynamic';
const STATUSES = ['applied', 'shortlisted', 'interview', 'offer', 'rejected'];

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="meta">No data yet.</p>;
  return <div className="hbars">{rows.map((r) => (
    <div key={r.label} className="hrow"><span className="hl">{r.label}</span><div className="ht"><div style={{ width: `${(r.value / max) * 100}%` }} /></div><b>{r.value}</b></div>
  ))}</div>;
}

export default async function Dashboard() {
  const me = await getUser();
  if (!me || me.role === 'candidate') return <p className="note">The dashboard is for recruiters and administrators. <Link href="/login">Log in</Link></p>;
  const admin = me.role === 'admin';
  await connect();
  const jobs = await Job.find(admin ? {} : { recruiter: me.id }).lean();
  const ids = jobs.map((j) => j._id);
  const match = { job: { $in: ids } };
  const t0 = Date.now();
  const [byStatus, byJob, avg, stale, supply] = await Promise.all([
    Application.aggregate([{ $match: match }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
    Application.aggregate([{ $match: match }, { $group: { _id: '$job', n: { $sum: 1 }, avg: { $avg: '$matchScore' } } }]),
    Application.aggregate([{ $match: match }, { $group: { _id: null, avg: { $avg: '$matchScore' } } }]),
    Application.countDocuments({ ...match, status: 'applied', createdAt: { $lt: new Date(Date.now() - 7 * 864e5) } }),
    Profile.aggregate([{ $match: { visible: true } }, { $unwind: '$skills' }, { $group: { _id: { $toLower: '$skills' }, n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 8 }]),
  ]);
  const count = (s) => byStatus.find((x) => x._id === s)?.n || 0;
  const total = byStatus.reduce((a, x) => a + x.n, 0);
  const demand = {};
  jobs.forEach((j) => (j.skills || []).forEach((s) => { const k = s.toLowerCase(); demand[k] = (demand[k] || 0) + 1; }));
  const demandRows = Object.entries(demand).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value]) => ({ label, value }));
  const jobRows = jobs.map((j) => ({ label: j.title, value: byJob.find((x) => String(x._id) === String(j._id))?.n || 0 })).sort((a, b) => b.value - a.value).slice(0, 8);
  const noApps = jobs.filter((j) => j.status === 'open' && !byJob.find((x) => String(x._id) === String(j._id))).length;
  const hired = count('offer');
  const rate = total ? Math.round((hired / total) * 100) : 0;

  let admin_ = null;
  if (admin) {
    const [roles, topArticles, profiles, docs] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', n: { $sum: 1 } } }]),
      Article.find({ status: 'published' }).sort({ views: -1 }).limit(5).select('title views').lean(),
      Profile.countDocuments(), Document.countDocuments(),
    ]);
    admin_ = { roles, topArticles, profiles, docs, dbMs: Date.now() - t0 };
  }

  const actions = [];
  if (stale) actions.push(`${stale} application${stale === 1 ? ' has' : 's have'} been waiting more than 7 days with no action. Review them.`);
  if (noApps) actions.push(`${noApps} open vacanc${noApps === 1 ? 'y has' : 'ies have'} no applicants yet. Add required skills or improve the description.`);
  if (count('shortlisted') && !count('interview')) actions.push('You have shortlisted candidates but no interviews. Send invitations.');
  if (!actions.length) actions.push('Nothing urgent. Your pipeline is up to date.');

  return (
    <>
      <section className="page-head"><div><h1>{admin ? 'Admin dashboard' : 'Recruitment dashboard'}</h1><p className="meta">{admin ? 'Platform-wide figures.' : 'Figures for your vacancies.'}</p></div></section>
      <div className="kpis">
        <div><b>{jobs.filter((j) => j.status === 'open').length}</b><span>open vacancies</span></div>
        <div><b>{total}</b><span>applications</span></div>
        <div><b>{Math.round(avg[0]?.avg || 0)}</b><span>average match score</span></div>
        <div><b>{rate}%</b><span>offer rate</span></div>
      </div>
      <section className="card wide"><h2>Recommended actions</h2><ul className="reasons">{actions.map((a) => <li key={a}>{a}</li>)}</ul></section>
      <div className="grid2">
        <section className="card wide"><h2>Hiring funnel</h2><Bars rows={STATUSES.map((s) => ({ label: s, value: count(s) }))} /></section>
        <section className="card wide"><h2>Applications per vacancy</h2><Bars rows={jobRows} /></section>
        <section className="card wide"><h2>Skills employers ask for</h2><Bars rows={demandRows} /></section>
        <section className="card wide"><h2>Skills candidates offer</h2><Bars rows={supply.map((s) => ({ label: s._id, value: s.n }))} /></section>
      </div>
      {admin_ && (
        <>
          <h2 style={{ marginTop: 30 }}>Platform</h2>
          <div className="kpis">
            {['candidate', 'recruiter', 'admin'].map((r) => <div key={r}><b>{admin_.roles.find((x) => x._id === r)?.n || 0}</b><span>{r}s</span></div>)}
            <div><b>{admin_.docs}</b><span>documents stored</span></div>
          </div>
          <div className="grid2">
            <section className="card wide"><h2>Most read help articles</h2><Bars rows={admin_.topArticles.map((a) => ({ label: a.title, value: a.views }))} /></section>
            <section className="card wide"><h2>System health</h2><p>Database responded in <b>{admin_.dbMs} ms</b>.</p><p className="meta">Profiles created: {admin_.profiles}. Monitor uptime by pointing a free service such as UptimeRobot at <code>/api/health</code>.</p></section>
          </div>
        </>
      )}
    </>
  );
}
