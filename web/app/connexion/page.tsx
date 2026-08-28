'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';

function ConnexionInner() {
  const { login, register, session, logout } = useShop();
  const router = useRouter();
  const next = useSearchParams().get('next') || '/produits';
  const [tab, setTab] = useState<'client' | 'pharmacy' | 'courier'>('client');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const go = (path: string) => {
    router.replace(path);
    router.refresh();
  };

  if (session) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-extrabold text-ink">Bonjour {session.firstName}</h1>
        <p className="mt-2 text-sm text-muted">{session.email}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/commandes" className="btn-primary">
            Mes commandes
          </Link>
          <Link href="/produits" className="btn-secondary">
            Continuer mes achats
          </Link>
          <button type="button" className="btn-secondary" onClick={() => { logout(); go('/'); }}>
            Se déconnecter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold text-ink">Connexion</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Même comptes démo que l’application. Pharmacies et livreurs se connectent dans l’app ; l’administration est sur{' '}
        <Link href="/admin" className="font-extrabold text-brand">
          /admin
        </Link>
        .
      </p>
      <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl border border-border bg-white p-1">
        {(['client', 'pharmacy', 'courier'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`h-10 rounded-xl text-xs font-extrabold ${tab === id ? 'bg-brand text-white' : 'text-muted'}`}
          >
            {id === 'client' ? 'Client' : id === 'pharmacy' ? 'Pharmacie' : 'Livreur'}
          </button>
        ))}
      </div>

      {tab !== 'client' ? (
        <div className="card mt-8 p-5">
          <p className="font-extrabold text-ink">Espace {tab === 'pharmacy' ? 'pharmacie' : 'livreur'}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            La gestion des commandes, du catalogue et des courses se fait dans l’application Go Pharma Pro, comme sur
            mobile.
          </p>
        </div>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            if (mode === 'login') {
              if (login(identifier, password) !== 'ok') {
                setError('Identifiants incorrects.');
                return;
              }
              go(next);
              return;
            }
            if (!firstName || !lastName || !email || !phone || password.length < 4) {
              setError('Complétez tous les champs.');
              return;
            }
            if (register({ firstName, lastName, email, phone, password }) !== 'ok') {
              setError('Un compte existe déjà avec cet e-mail ou ce téléphone.');
              return;
            }
            go(next);
          }}
        >
          {mode === 'register' ? (
            <>
              <Field label="Prénom" value={firstName} onChange={setFirstName} />
              <Field label="Nom" value={lastName} onChange={setLastName} />
              <Field label="E-mail" value={email} onChange={setEmail} />
              <Field label="Téléphone" value={phone} onChange={setPhone} placeholder="77 00 00 00" />
            </>
          ) : (
            <Field
              label="Téléphone ou e-mail"
              value={identifier}
              onChange={setIdentifier}
              placeholder="77 00 00 00"
            />
          )}
          <Field label="Mot de passe" value={password} onChange={setPassword} type="password" />
          {error ? <p className="text-sm font-bold text-danger">{error}</p> : (
            <p className="text-xs text-muted">Démo : demo123 — 77 00 00 00 ou awa@pharmamarket.ga</p>
          )}
          <button type="submit" className="btn-primary w-full">
            {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
          <button
            type="button"
            className="w-full text-sm font-extrabold text-brand"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Créer un compte client' : 'J’ai déjà un compte'}
          </button>
        </form>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-ink">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        className="mt-1 h-12 w-full rounded-2xl border border-border bg-white px-4 font-semibold text-ink outline-none focus:border-brand"
      />
    </label>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense>
      <ConnexionInner />
    </Suspense>
  );
}
