'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@gopharmapro.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError('Identifiants incorrects.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-extrabold text-ink">E-mail</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="username"
          className="mt-1 h-12 w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
        />
      </label>
      <label className="block">
        <span className="text-sm font-extrabold text-ink">Mot de passe</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="demo123"
          className="mt-1 h-12 w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
        />
      </label>
      {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
