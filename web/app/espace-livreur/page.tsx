'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import { usePartnerJobs } from '@/lib/usePartnerJobs';

function CourierHome() {
  const { session } = useShop();
  const router = useRouter();
  const { jobs, available, setAvailable, accept } = usePartnerJobs();
  if (!isCourier(session)) return null;

  const mine = jobs.filter((o) => o.courierId === session.id);
  const done = mine.filter((o) => o.status === 'delivered');
  const open = jobs.filter((o) => !o.courierId && o.status === 'ready');
  const todayGain = mine.reduce((a, o) => a + o.fee, 0);

  return (
    <>
      <p className="text-lg font-extrabold text-ink">Bonjour {session.firstName} 👋</p>
      <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-extrabold text-ink">Statut</p>
          <span className={`mt-2 inline-flex ${available ? 'badge-green' : 'badge-orange'}`}>
            {available ? 'Disponible' : 'Indisponible'}
          </span>
        </div>
        <button type="button" className="btn-secondary !h-10 text-sm" onClick={() => setAvailable(!available)}>
          {available ? 'Indisponible' : 'Disponible'}
        </button>
      </div>

      <h2 className="mt-8 text-lg font-extrabold text-ink">Résumé du jour</h2>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-2xl font-extrabold text-ink">{mine.length}</p>
          <p className="text-xs font-bold text-muted">Livraisons</p>
        </div>
        <div className="card p-4">
          <p className="text-lg font-extrabold text-ink">{formatFcfa(todayGain)}</p>
          <p className="text-xs font-bold text-muted">Revenus</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-extrabold text-ink">{done.length}</p>
          <p className="text-xs font-bold text-muted">Terminées</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-extrabold text-ink">Nouvelles livraisons</h2>
      {!available ? (
        <div className="card mt-3 p-5 text-sm text-muted">Passez disponible pour recevoir des missions.</div>
      ) : open.length === 0 ? (
        <div className="card mt-3 p-5 text-sm text-muted">Aucune nouvelle course pour le moment.</div>
      ) : (
        <div className="mt-3 space-y-3">
          {open.map((o) => (
            <div key={o.id} className="card p-5">
              <p className="font-extrabold text-ink">Livraison #{o.id}</p>
              <p className="mt-2 text-sm text-muted">🏥 {o.pharmacyName}</p>
              <p className="text-sm text-muted">📍 {o.pharmacyKm}</p>
              <p className="my-1 font-extrabold text-muted">↓</p>
              <p className="text-sm text-muted">👤 Client</p>
              <p className="text-sm text-muted">📍 {o.clientKm}</p>
              <p className="mt-3 font-extrabold text-brand">Gain livraison : {formatFcfa(o.fee)}</p>
              <p className="text-sm text-muted">⏱️ Estimation : {o.eta}</p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link href={`/espace-livreur/livraisons/${o.id}`} className="btn-secondary !h-10 text-sm">
                  Voir la livraison
                </Link>
                <button
                  type="button"
                  className="btn-primary !h-10 text-sm"
                  onClick={() => {
                    accept(o.id, session.id);
                    router.push(`/espace-livreur/livraisons/${o.id}`);
                  }}
                >
                  Accepter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <h2 className="mt-8 text-lg font-extrabold text-ink">Notifications</h2>
      <div className="mt-3 space-y-2 text-sm">
        <div className="card p-4">🚚 Nouvelle livraison disponible</div>
        <div className="card p-4">📦 La pharmacie a préparé la commande</div>
        <div className="card p-4">⚠️ Le client a modifié son adresse</div>
        <div className="card p-4">✅ Livraison confirmée</div>
      </div>
    </>
  );
}

export default function CourierSpacePage() {
  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <CourierHome />
      </main>
    </RequireRole>
  );
}
