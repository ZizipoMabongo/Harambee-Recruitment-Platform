'use client';
import { useEffect, useState } from 'react';

export default function Notifications() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    fetch('/api/notifications').then(async (r) => {
      const d = await r.json();
      if (!r.ok) return setErr(d.error);
      setItems(d.notifications);
      fetch('/api/notifications', { method: 'POST' }); // mark as read after showing
    });
  }, []);
  if (err) return <p className="note">{err} <a href="/login">Log in</a></p>;
  if (!items) return <p className="meta">Loading…</p>;
  return (
    <>
      <section className="page-head"><div><h1>Alerts</h1><p className="meta">Application updates, interview invitations and messages.</p></div></section>
      <div className="list">
        {items.map((n) => (
          <a key={n.id} href={n.link} className={`item ${n.read ? '' : 'unread'}`}><b>{n.title}</b>{n.body && <span className="meta">{n.body}</span>}<span className="meta">{new Date(n.at).toLocaleString('en-ZA')}</span></a>
        ))}
        {!items.length && <p className="note">Nothing yet. You will see updates here when something happens on your applications.</p>}
      </div>
    </>
  );
}
