'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('mode') === 'register') setMode('register');
    if (q.get('role') === 'recruiter') setF((x) => ({ ...x, role: 'recruiter' }));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    router.push(data.role === 'candidate' && mode === 'register' ? '/profile' : '/jobs'); router.refresh();
  }

  return (
    <div className="auth">
      <form className="card form" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        {mode === 'register' && <label>Full name<input value={f.name} onChange={set('name')} required /></label>}
        <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} minLength={8} required /></label>
        {mode === 'register' && <label>I am a<select value={f.role} onChange={set('role')}><option value="candidate">Candidate looking for work</option><option value="recruiter">Recruiter hiring talent</option></select></label>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn">{mode === 'login' ? 'Log in' : 'Register'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already registered? Log in'}
        </button>
      </form>
    </div>
  );
}
