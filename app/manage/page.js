'use client';
import { useEffect, useState } from 'react';
import { CATEGORIES, catName } from '@/lib/categories';

const blank = { title: '', body: '', category: 'faq', status: 'draft' };

export default function Manage() {
  const [me, setMe] = useState(undefined);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(null); // null = hidden; object = editing/creating
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => fetch('/api/articles?all=1').then((r) => r.json()).then((d) => setItems(d.articles || []));
  useEffect(() => { fetch('/api/auth/me').then((r) => r.json()).then((d) => { setMe(d.user); if (d.user && d.user.role !== 'candidate') load(); }); }, []);

  if (me === undefined) return <p className="meta">Loading…</p>;
  if (!me || me.role === 'candidate') return <p className="note">Only recruiters and administrators can manage articles. <a href="/login">Log in</a></p>;

  const isAdmin = me.role === 'admin';
  const canEdit = (a) => isAdmin || a.author === me.id;

  async function save(e) {
    e.preventDefault(); setError('');
    const res = await fetch(editId ? `/api/articles/${editId}` : '/api/articles', { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await res.json();
    if (!res.ok) return setError(d.error);
    setForm(null); setEditId(null); load();
  }
  async function remove(id) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
    if (res.ok) load(); else setError((await res.json()).error);
  }

  return (
    <>
      <div className="row"><h1>Manage articles</h1><button className="btn" onClick={() => { setForm(blank); setEditId(null); }}>New article</button></div>
      <p className="note">{isAdmin ? 'Administrator: create, edit, publish and delete any article.' : 'Recruiter: new articles are saved as drafts for an administrator to publish. You can edit your own.'}</p>
      {error && <p className="error" role="alert">{error}</p>}
      {form && (
        <form className="card form" onSubmit={save}>
          <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
          <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Article text<textarea rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></label>
          {isAdmin && <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label>}
          <div className="row"><button className="btn">Save article</button><button type="button" className="btn alt" onClick={() => setForm(null)}>Cancel</button></div>
        </form>
      )}
      <div className="table"><table>
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{items.map((a) => (
          <tr key={a.id}><td>{a.title}</td><td>{catName(a.category)}</td><td>{a.status}</td>
            <td className="row">
              {canEdit(a) && <button className="btn alt" onClick={() => { setForm({ title: a.title, body: a.body, category: a.category, status: a.status }); setEditId(a.id); }}>Edit</button>}
              {isAdmin && <button className="btn danger" onClick={() => remove(a.id)}>Delete</button>}
            </td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
