'use client';
import { useEffect, useState } from 'react';

const STATUSES = ['applied', 'shortlisted', 'interview', 'offer', 'rejected'];
const blank = { title: '', company: '', location: '', description: '', skills: '', autoShortlist: false };

export default function Jobs() {
  const [me, setMe] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [msg, setMsg] = useState('');
  const [f, setF] = useState(blank);

  const loadJobs = () => fetch('/api/jobs').then((r) => r.json()).then((d) => setJobs(d.jobs || []));
  const loadApps = () => fetch('/api/applications').then((r) => (r.ok ? r.json() : { applications: [] })).then((d) => setApps(d.applications));
  useEffect(() => { loadJobs(); fetch('/api/auth/me').then((r) => r.json()).then((d) => { setMe(d.user); if (d.user) loadApps(); }); }, []);

  async function call(url, method, body) {
    setMsg('');
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
    const d = await res.json();
    setMsg(res.ok ? (d.auto ? 'Applied. You were shortlisted automatically.' : 'Done.') : d.error);
    if (res.ok) { loadJobs(); loadApps(); }
    return res.ok;
  }
  async function post(e) { e.preventDefault(); if (await call('/api/jobs', 'POST', f)) setF(blank); }
  const staff = me && me.role !== 'candidate';
  const sorted = staff ? [...apps].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)) : apps;

  return (
    <>
      <section className="page-head"><div><h1>Jobs</h1><p className="meta">Open vacancies from employers on Harambee.</p></div></section>
      {msg && <p className="note" role="status">{msg}</p>}
      {staff && (
        <form className="card form wide" onSubmit={post}>
          <h2>Post a vacancy</h2>
          <div className="two"><label>Title<input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></label><label>Company<input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} required /></label></div>
          <label>Location<input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} required /></label>
          <label>Description<textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} required /></label>
          <label>Required skills (separate with commas, used for matching)<input value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="React, SQL, Communication" /></label>
          <label className="check"><input type="checkbox" checked={f.autoShortlist} onChange={(e) => setF({ ...f, autoShortlist: e.target.checked })} /> Automatically shortlist applicants who score 70 or more</label>
          <button className="btn">Publish vacancy</button>
        </form>
      )}
      <div className="list">
        {jobs.map((j) => (
          <div key={j.id} className="item"><b>{j.title}</b><span className="meta">{j.company} · {j.location}</span><p>{j.description}</p>
            {j.skills?.length > 0 && <div className="chips">{j.skills.map((s) => <span key={s} className="pill">{s}</span>)}</div>}
            {me?.role === 'candidate' && <div><button className="btn" onClick={() => call(`/api/jobs/${j.id}/apply`, 'POST')}>Apply</button></div>}
            {!me && <a href="/login">Log in to apply</a>}
          </div>
        ))}
        {!jobs.length && <p className="note">No open vacancies yet.</p>}
      </div>
      {me && (
        <>
          <h2>{staff ? 'Applicants (best match first)' : 'My applications'}</h2>
          <div className="list">
            {sorted.map((a) => (
              <div key={a.id} className="item">
                <div className="row"><b>{a.job?.title}</b>{staff && <span className={`score ${a.matchLabel}`}>{a.matchScore}/100</span>}</div>
                <span className="meta">{a.job?.company}{staff && a.candidate ? <> · <a href={`/candidates/${a.candidate.id}`}>{a.candidate.name}</a> ({a.candidate.email})</> : ''}</span>
                <div className="row-gap">
                  {staff ? <select value={a.status} onChange={(e) => call(`/api/applications/${a.id}`, 'PATCH', { status: e.target.value })} aria-label="Status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select> : <span className="tag">{a.status}</span>}
                  <a href={`/applications/${a.id}`}>Open messages and interview</a>
                </div>
              </div>
            ))}
            {!sorted.length && <p className="note">Nothing here yet.</p>}
          </div>
        </>
      )}
    </>
  );
}
