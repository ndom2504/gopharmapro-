'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import { usePartnerJobs } from '@/lib/usePartnerJobs';

export default function CourierRunsPage() {
  const { session } = useShop();
  const { jobs } = usePartnerJobs();
  const [filter, setFilter] = useState<'all' | 'done' | 'cancel'>('all');
  if (!isCourier(session)) {
    return (
      <RequireRole role="courier">
        <div />
      </RequireRole>
    );
  }
  const mine = jobs.filter((o) => o.courierId === session.id);
  const list = mine.filter((o) => {
    if (filter === 'done') return o.status === 'delivered';
    if (filter === 'cancel') return false;
    return true;
  });
  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <h1 className="text-3xl font-extrabold text-ink">Livraisons</h1>
        <div className="mt-4 flex gap-2">
          {[
            { id: 'all' as const, label: 'Toutes' },
            { id: 'done' as const, label: 'Terminées' },
            { id: 'cancel' as const, label: 'Annulées' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${
                filter === f.id ? 'bg-brand text-white' : 'border border-border bg-white text-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {list.length === 0 ? <p className="text-sm text-muted">Aucune course dans ce filtre.</p> : null}
          {list.map((o) => (
            <Link key={o.id} href={`/espace-livreur/livraisons/${o.id}`} className="card block p-5">
              <div className="flex justify-between gap-3">
                <p className="font-extrabold text-ink">#{o.id}</p>
                <span className={o.status === 'delivered' ? 'badge-green' : 'badge-orange'}>
                  {o.status === 'delivered' ? '✓ Livrée' : 'En cours'}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{o.createdAt}</p>
              <p className="mt-1 font-extrabold text-brand">{formatFcfa(o.fee)}</p>
            </Link>
          ))}
        </div>
      </main>
    </RequireRole>
  );
}
