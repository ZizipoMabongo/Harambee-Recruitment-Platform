'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ApplicationThread() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [iv, setIv] = useState({ when: '', location: '', note: '' });

  const load = () => fetch(`/api/applications/${id}/thread`).then(async (r) => { const j = await r.json(); if (!r.ok) setErr(j.error); else { setErr(''); setD(j); } });
  useEffect(() => { load(); }, [id]);

  async function act(body) {
    setErr('');
    const r = await fetch(`/api/applications/${id}/thread`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json();
    if (!r.ok) { setErr(j.error); return false; }
    load(); return true;
  }
  async function send(e) { e.preventDefault(); if (await act({ action: 'message', body: text })) setText(''); }
  async function invite(e) { e.preventDefault(); await act({ action: 'invite', when: iv.when ? new Date(iv.when).toISOString() : '', location: iv.location, note: iv.note }); }

  if (err && !d) return <p className="note">{err} <a href="/login">Log in</a></p>;
  if (!d) return <p className="meta">Loading…</p>;
  const { application: a, interview, messages, viewer } = d;
  const staff = viewer === 'staff';

  return (
    <>
      <section className="page-head"><div><h1>{a.job.title}</h1><p className="meta">{a.job.company} · {staff ? <a href={`/candidates/${a.candidate.id}`}>{a.candidate.name}</a> : 'Your application'}</p></div><span className="pill">{a.status}</span></section>
      {err && <p className="error" role="alert">{err}</p>}

      {staff && (
        <section className="card wide">
          <h2>Match score <span className={`score ${a.matchLabel}`}>{a.matchScore}/100 · {a.matchLabel}</span></h2>
          <ul className="reasons">{(a.matchNotes || []).map((n, i) => <li key={i}>{n}</li>)}</ul>
          <p className="meta">Scores are calculated automatically from skills, location and profile completeness. Treat them as a guide, not a decision.</p>
        </section>
      )}

      <section className="card wide">
        <h2>Interview</h2>
        {interview ? (
          <p><b>{new Date(interview.when).toLocaleString('en-ZA')}</b>{interview.location && ` · ${interview.location}`}<br /><span className="meta">{interview.note}</span><br /><span className={`pill ${interview.status === 'accepted' ? 'ok' : ''}`}>{interview.status}</span></p>
        ) : <p className="meta">No interview scheduled yet.</p>}
        {viewer === 'candidate' && interview?.status === 'invited' && (
          <div className="row-gap"><button className="btn" onClick={() => act({ action: 'respond', value: 'accepted' })}>Accept</button><button className="btn danger" onClick={() => act({ action: 'respond', value: 'declined' })}>Decline</button></div>
        )}
        {staff && (
          <form className="form" onSubmit={invite}>
            <div className="two"><label>Date and time<input type="datetime-local" value={iv.when} onChange={(e) => setIv({ ...iv, when: e.target.value })} required /></label><label>Location or video link<input value={iv.location} onChange={(e) => setIv({ ...iv, location: e.target.value })} /></label></div>
            <label>Note to candidate<input value={iv.note} onChange={(e) => setIv({ ...iv, note: e.target.value })} /></label>
            <button className="btn">{interview ? 'Reschedule interview' : 'Send interview invitation'}</button>
          </form>
        )}
      </section>

      <section className="card wide">
        <div className="row"><h2>Messages</h2><button className="link" onClick={load}>Refresh</button></div>
        <div className="thread">
          {messages.map((m) => <div key={m.id} className={`msg ${m.mine ? 'mine' : ''}`}><span className="meta">{m.from} · {new Date(m.at).toLocaleString('en-ZA')}</span><p>{m.body}</p></div>)}
          {!messages.length && <p className="meta">No messages yet.</p>}
        </div>
        <form className="search" onSubmit={send}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" maxLength={1000} aria-label="Message" /><button className="btn">Send</button></form>
      </section>
    </>
  );
}
