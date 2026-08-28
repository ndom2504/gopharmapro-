'use client';

import Link from 'next/link';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier } from '@/lib/accounts';
import { usePartnerJobs } from '@/lib/usePartnerJobs';

export default function CourierMapPage() {
  const { session } = useShop();
  const { jobs } = usePartnerJobs();
  const active = isCourier(session)
    ? jobs.find((o) => o.courierId === session.id && o.status !== 'delivered')
    : undefined;

  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <h1 className="text-3xl font-extrabold text-ink">Carte</h1>
        {!active ? (
          <div className="card mt-6 p-5 text-sm text-muted">
            Acceptez une livraison pour afficher l’itinéraire pharmacie → client.
          </div>
        ) : (
          <div className="card mt-6 p-5 text-center">
            <p className="font-extrabold text-ink">🏥 {active.pharmacyName}</p>
            <p className="my-2 font-extrabold text-muted">│</p>
            <p className="text-2xl">🚚</p>
            <p className="my-2 font-extrabold text-muted">│</p>
            <p className="font-extrabold text-ink">👤 Client</p>
            <p className="mt-2 text-sm text-muted">{active.deliveryAddress}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(active.deliveryAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary mt-6 inline-flex"
            >
              🧭 Naviguer
            </a>
            <Link href={`/espace-livreur/livraisons/${active.id}`} className="btn-secondary mt-3 inline-flex">
              Ouvrir la course
            </Link>
          </div>
        )}
      </main>
    </RequireRole>
  );
}
