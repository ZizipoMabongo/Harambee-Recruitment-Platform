'use client';
import { useState } from 'react';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [log, setLog] = useState([{ from: 'bot', text: 'Hi! Ask me about profiles, CVs, applications or interviews.' }]);

  async function ask(e) {
    e.preventDefault();
    const m = q.trim();
    if (!m) return;
    setQ('');
    setLog((l) => [...l, { from: 'me', text: m }]);
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: m }) });
    const d = await res.json();
    setLog((l) => [...l, { from: 'bot', text: d.reply || d.error, sources: d.sources }]);
  }

  return (
    <div className="chat noprint">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Help assistant">
          <div className="chat-log">
            {log.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>{m.text}
                {m.sources?.map((s) => <a key={s.slug} href={`/articles/${s.slug}`} className="src">{s.title}</a>)}
              </div>
            ))}
          </div>
          <form onSubmit={ask} className="chat-form"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type your question" aria-label="Your question" /><button className="btn sm">Send</button></form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Toggle help assistant">{open ? '×' : 'Ask'}</button>
    </div>
  );
}
