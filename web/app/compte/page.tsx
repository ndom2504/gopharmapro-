'use client';

import Link from 'next/link';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, isClient } from '@/lib/accounts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const rows = [
  { href: '#', label: 'Informations personnelles' },
  { href: '#', label: 'Téléphone' },
  { href: '#', label: 'Email' },
  { href: '#', label: 'Photo' },
  { href: '#', label: 'Mes adresses' },
  { href: '/commandes', label: 'Mes commandes' },
  { href: '/ordonnances', label: 'Mes ordonnances' },
  { href: '/favoris', label: 'Mes favoris' },
  { href: '#', label: 'Moyens de paiement' },
  { href: '#', label: 'Notifications' },
  { href: '#', label: 'Sécurité' },
  { href: 'mailto:contact@gopharmapro.com', label: 'Aide & support' },
  { href: '#', label: 'Conditions d’utilisation' },
];

export default function ComptePage() {
  const { session, logout, ready } = useShop();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);
  if (!ready || (session && !isClient(session))) return null;
  if (!session) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold">Mon compte</h1>
        <Link href="/connexion?next=/compte" className="btn-primary mt-8 inline-flex">
          Connexion
        </Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mon compte</h1>
      <div className="card mt-6 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mint text-lg font-extrabold text-brand">
          {displayName(session)[0]}
          {isClient(session) ? session.lastName[0] : ''}
        </div>
        <p className="mt-3 font-extrabold text-ink">
          {displayName(session)} {isClient(session) ? session.lastName : ''}
        </p>
        <p className="text-sm text-muted">{session.phone}</p>
        <p className="text-sm text-muted">{session.email}</p>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((r) =>
          r.href === '#' ? (
            <div key={r.label} className="card p-4 font-extrabold text-ink">
              {r.label}
            </div>
          ) : (
            <Link key={r.label} href={r.href} className="card block p-4 font-extrabold text-ink">
              {r.label}
            </Link>
          ),
        )}
        <button
          type="button"
          className="btn-secondary mt-4 w-full"
          onClick={() => {
            logout();
            router.replace('/');
          }}
        >
          Déconnexion
        </button>
      </div>
    </main>
  );
}
