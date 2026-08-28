'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import { usePartnerJobs } from '@/lib/usePartnerJobs';

export default function CourierRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useShop();
  const { jobs, accept, setStatus } = usePartnerJobs();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const job = jobs.find((o) => o.id === id);

  if (!job) {
    return (
      <RequireRole role="courier">
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-extrabold">Livraison introuvable</h1>
          <Link href="/espace-livreur/livraisons" className="btn-primary mt-8 inline-flex">
            Livraisons
          </Link>
        </main>
      </RequireRole>
    );
  }

  const confirm = () => {
    if (code.replace(/\D/g, '') !== job.deliveryCode) {
      setError('Code incorrect. Demandez-le au client.');
      return;
    }
    setStatus(job.id, 'delivered');
    setError('');
  };

  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <p className="text-sm font-extrabold text-muted">Livraison #{job.id}</p>
        <h1 className="mt-1 text-3xl font-extrabold text-ink">Récupération</h1>
        <div className="card mt-6 p-5">
          <p className="font-extrabold text-ink">🏥 {job.pharmacyName}</p>
          <p className="mt-1 text-sm text-muted">📍 {job.pharmacyAddress}</p>
          <p className="mt-4 text-sm font-extrabold text-ink">Commande</p>
          {job.items.map((i) => (
            <p key={i.name} className="mt-1 text-sm text-muted">
              {i.name} × {i.quantity}
            </p>
          ))}
          <p className="mt-3 text-xs font-bold text-muted">
            ⚠️ Informations médicales minimisées — uniquement ce qui est nécessaire à la livraison.
          </p>
          <p className="mt-3 font-extrabold text-brand">Gain : {formatFcfa(job.fee)}</p>
        </div>

        {job.status === 'ready' && isCourier(session) ? (
          <button type="button" className="btn-primary mt-6 w-full" onClick={() => accept(job.id, session.id)}>
            Accepter
          </button>
        ) : null}

        {job.status === 'accepted' ? (
          <button type="button" className="btn-primary mt-6 w-full" onClick={() => setStatus(job.id, 'picked_up')}>
            Je récupère la commande
          </button>
        ) : null}

        {job.status === 'picked_up' || job.status === 'arrived' ? (
          <div className="card mt-6 p-5">
            <p className="font-extrabold text-ink">Commande récupérée</p>
            <p className="mt-2 text-muted">↓</p>
            <p className="font-extrabold text-ink">En route vers le client</p>
            <p className="mt-2 text-muted">↓</p>
            <p className="font-extrabold text-ink">Arrivé chez le client</p>
            <p className="mt-2 text-muted">↓</p>
            <p className="font-extrabold text-muted">Livraison effectuée</p>
            <p className="mt-6 text-sm font-extrabold text-ink">Demandez au client son code de confirmation.</p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="_ _ _ _ _ _"
              className="mt-3 h-12 w-full rounded-2xl border border-border px-4 text-center font-extrabold tracking-[0.4em]"
            />
            {error ? <p className="mt-2 text-sm font-bold text-danger">{error}</p> : null}
            <button type="button" className="btn-primary mt-4 w-full" onClick={confirm}>
              Confirmer la livraison
            </button>
          </div>
        ) : null}

        {job.status === 'delivered' ? (
          <div className="card mt-6 border-[#BCE9D8] bg-[#E7F7F1] p-5">
            <p className="font-extrabold text-ink">✅ Livraison confirmée</p>
          </div>
        ) : null}

        <Link href="/espace-livreur/carte" className="btn-secondary mt-6 inline-flex">
          🧭 Naviguer
        </Link>
      </main>
    </RequireRole>
  );
}
