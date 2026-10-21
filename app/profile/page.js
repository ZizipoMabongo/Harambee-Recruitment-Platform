'use client';
import { useEffect, useState } from 'react';

const emptyExp = { role: '', company: '', from: '', to: '', desc: '' };
const emptyEdu = { school: '', qualification: '', year: '' };

export default function Profile() {
  const [me, setMe] = useState(undefined);
  const [p, setP] = useState(null);
  const [docs, setDocs] = useState([]);
  const [msg, setMsg] = useState('');
  const [kind, setKind] = useState('cv');

  const loadDocs = () => fetch('/api/documents').then((r) => r.json()).then((d) => setDocs(d.documents || []));
  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then((d) => {
      setMe(d.user);
      if (d.user?.role === 'candidate') {
        fetch('/api/profile').then((r) => r.json()).then(({ profile }) => setP({ ...profile, skills: (profile.skills || []).join(', ') }));
        loadDocs();
      }
    });
  }, []);

  if (me === undefined) return <p className="meta">Loading…</p>;
  if (me?.role !== 'candidate') return <p className="note">Profiles are for candidates. <a href="/login">Log in as a candidate</a></p>;
  if (!p) return <p className="meta">Loading…</p>;

  const set = (k) => (e) => setP({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setItem = (key, i, k) => (e) => setP({ ...p, [key]: p[key].map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)) });
  const add = (key, blank) => () => setP({ ...p, [key]: [...(p[key] || []), { ...blank }] });
  const del = (key, i) => () => setP({ ...p, [key]: p[key].filter((_, j) => j !== i) });

  async function save(e) {
    e.preventDefault(); setMsg('');
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
    setMsg(res.ok ? 'Profile saved.' : (await res.json()).error);
  }
  async function upload(e) {
    e.preventDefault(); setMsg('');
    const file = e.target.file.files[0];
    if (!file) return setMsg('Choose a file first.');
    const fd = new FormData(); fd.append('file', file); fd.append('kind', kind);
    const res = await fetch('/api/documents', { method: 'POST', body: fd });
    const d = await res.json();
    setMsg(res.ok ? 'Document uploaded.' : d.error);
    if (res.ok) { e.target.reset(); loadDocs(); }
  }
  async function removeDoc(id) {
    if (!confirm('Delete this document?')) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE' }); loadDocs();
  }

  const pct = Math.round(([p.headline, p.location, p.phone, p.summary, p.skills, p.experience?.length, p.education?.length, docs.length].filter(Boolean).length / 8) * 100);

  return (
    <>
      <section className="page-head">
        <div><h1>My profile</h1><p className="meta">Recruiters see this profile. Your CV page is built from it.</p></div>
        <a className="btn alt" href={`/candidates/${me.id}`}>Preview my CV</a>
      </section>
      <div className="progress" aria-label={`Profile ${pct}% complete`}><div style={{ width: `${pct}%` }} /></div>
      <p className="meta">Profile {pct}% complete</p>
      {msg && <p className="note" role="status">{msg}</p>}

      <form className="card form wide" onSubmit={save}>
        <h2>About you</h2>
        <label>Headline (for example: Junior web developer)<input value={p.headline || ''} onChange={set('headline')} maxLength={120} /></label>
        <div className="two"><label>Location<input value={p.location || ''} onChange={set('location')} /></label><label>Phone<input value={p.phone || ''} onChange={set('phone')} /></label></div>
        <label>Summary<textarea rows={4} value={p.summary || ''} onChange={set('summary')} maxLength={1200} /></label>
        <label>Skills (separate with commas)<input value={p.skills} onChange={set('skills')} placeholder="React, SQL, Customer service" /></label>

        <h2>Experience</h2>
        {(p.experience || []).map((x, i) => (
          <div key={i} className="sub"><div className="two"><label>Role<input value={x.role || ''} onChange={setItem('experience', i, 'role')} /></label><label>Company<input value={x.company || ''} onChange={setItem('experience', i, 'company')} /></label></div>
            <div className="two"><label>From<input value={x.from || ''} onChange={setItem('experience', i, 'from')} placeholder="Jan 2024" /></label><label>To<input value={x.to || ''} onChange={setItem('experience', i, 'to')} placeholder="Present" /></label></div>
            <label>What you did<textarea rows={2} value={x.desc || ''} onChange={setItem('experience', i, 'desc')} /></label>
            <button type="button" className="link" onClick={del('experience', i)}>Remove</button></div>
        ))}
        <button type="button" className="btn alt" onClick={add('experience', emptyExp)}>+ Add experience</button>

        <h2>Education</h2>
        {(p.education || []).map((x, i) => (
          <div key={i} className="sub"><div className="two"><label>Qualification<input value={x.qualification || ''} onChange={setItem('education', i, 'qualification')} /></label><label>School / institution<input value={x.school || ''} onChange={setItem('education', i, 'school')} /></label></div>
            <label>Year<input value={x.year || ''} onChange={setItem('education', i, 'year')} /></label>
            <button type="button" className="link" onClick={del('education', i)}>Remove</button></div>
        ))}
        <button type="button" className="btn alt" onClick={add('education', emptyEdu)}>+ Add education</button>

        <h2>Privacy</h2>
        <label className="check"><input type="checkbox" checked={!!p.visible} onChange={set('visible')} /> Let recruiters find my profile and view my documents. If off, only recruiters whose vacancy you applied to can see them.</label>
        <label className="check"><input type="checkbox" checked={!!p.openToWork} onChange={set('openToWork')} /> Show an &ldquo;Open to work&rdquo; badge</label>
        <button className="btn">Save profile</button>
      </form>

      <section className="card wide">
        <h2>My documents</h2>
        <p className="meta">PDF or Word (.docx), up to 4 MB each, 10 files maximum.</p>
        <form className="row-gap" onSubmit={upload}>
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Document type"><option value="cv">CV</option><option value="certificate">Certificate</option><option value="id">ID document</option><option value="other">Other</option></select>
          <input type="file" name="file" accept=".pdf,.docx,application/pdf" />
          <button className="btn">Upload</button>
        </form>
        <div className="list" style={{ marginTop: 14 }}>
          {docs.map((d) => (
            <div key={d.id} className="item"><b>{d.name}</b><span className="meta">{d.kind.toUpperCase()} · {(d.size / 1024).toFixed(0)} KB</span>
              <div className="row-gap"><a href={`/api/documents/${d.id}`} target="_blank" rel="noreferrer">Open</a><button className="link" onClick={() => removeDoc(d.id)}>Delete</button></div></div>
          ))}
          {!docs.length && <p className="note">No documents yet.</p>}
        </div>
      </section>
    </>
  );
}
