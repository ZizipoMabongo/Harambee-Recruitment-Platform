// Shared, printable profile / CV layout (server component).
export default function ProfileView({ name, email, p, docs = [] }) {
  const ini = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <article className="cv">
      <div className="cv-head">
        <div className="avatar">{ini}</div>
        <div>
          <h1>{name}</h1>
          <p className="cv-title">{p.headline || 'Candidate'}</p>
          <p className="meta">{[p.location, p.phone, email].filter(Boolean).join(' · ')}</p>
          {p.openToWork && <span className="pill ok">Open to work</span>}
        </div>
      </div>
      {p.summary && <section><h2>About</h2><p className="body">{p.summary}</p></section>}
      {p.skills?.length > 0 && <section><h2>Skills</h2><div className="chips">{p.skills.map((s) => <span key={s} className="pill">{s}</span>)}</div></section>}
      {p.experience?.length > 0 && <section><h2>Experience</h2>{p.experience.map((e, i) => (
        <div key={i} className="tl"><b>{e.role}</b> <span className="meta">{e.company}{(e.from || e.to) && ` · ${e.from || ''} – ${e.to || 'Present'}`}</span>{e.desc && <p className="body">{e.desc}</p>}</div>
      ))}</section>}
      {p.education?.length > 0 && <section><h2>Education</h2>{p.education.map((e, i) => (
        <div key={i} className="tl"><b>{e.qualification}</b> <span className="meta">{e.school}{e.year && ` · ${e.year}`}</span></div>
      ))}</section>}
      {docs.length > 0 && <section className="noprint"><h2>Documents</h2>{docs.map((d) => (
        <a key={String(d._id)} className="item" href={`/api/documents/${d._id}`} target="_blank" rel="noreferrer"><b>{d.name}</b><span className="meta">{d.kind.toUpperCase()} · {(d.size / 1024).toFixed(0)} KB</span></a>
      ))}</section>}
    </article>
  );
}
