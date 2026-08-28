'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';
import { displayName, homeFor, isClient } from '@/lib/accounts';

export default function CommandesPage() {
  const { session, orders, logout, ready } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);

  if (!ready || (session && !isClient(session))) return null;

  if (!session) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-ink">Mes commandes</h1>
        <p className="mt-2 text-muted">Connectez-vous pour suivre vos achats.</p>
        <Link href="/connexion?next=/commandes" className="btn-primary mt-8 inline-flex">
          Connexion
        </Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Mes commandes</h1>
          <p className="mt-1 text-sm text-muted">
            {displayName(session)} {isClient(session) ? session.lastName : ''}
            {isClient(session) && (session.provider === 'google' || session.googleId) ? ' · Google' : ''}
          </p>
        </div>
        <button type="button" className="btn-secondary !h-10 text-sm" onClick={logout}>
          Déconnexion
        </button>
      </div>
      <div className="mt-8 space-y-3">
        {orders.length === 0 ? <p className="text-sm text-muted">Aucune commande pour le moment.</p> : null}
        {orders.map((o) => (
          <Link key={o.id} href={`/commandes/${o.id}`} className="card block p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-extrabold text-ink">#{o.id}</p>
              <span className="badge-green">{o.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {formatFcfa(o.total)} · {o.paymentLabel} · {o.fulfillment === 'delivery' ? 'Livraison' : 'Retrait'}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
