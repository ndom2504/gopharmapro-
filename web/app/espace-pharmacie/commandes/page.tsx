'use client';

import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy, partnerOrders } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';

const statusLabel: Record<string, string> = {
  ready: 'Prête',
  accepted: 'Livreur assigné',
  picked_up: 'En livraison',
  arrived: 'Livreur arrivé',
  delivered: 'Livrée',
};

export default function PharmacyOrdersPage() {
  const { session } = useShop();
  const jobs = isPharmacy(session) ? partnerOrders.filter((o) => o.pharmacyAccountId === session.id) : [];
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Commandes</h1>
        <div className="mt-6 space-y-3">
          {jobs.map((o) => (
            <div key={o.id} className="card min-w-0 p-4 sm:p-5">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <p className="min-w-0 break-words font-extrabold text-ink">#{o.id}</p>
                <span className="badge-green shrink-0">{statusLabel[o.status] || o.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{formatFcfa(o.total)}</p>
              {o.items.map((i) => (
                <p key={i.name} className="break-words text-sm text-muted">
                  {i.name} × {i.quantity}
                </p>
              ))}
              <p className="mt-3 break-words font-extrabold tracking-wide text-brand sm:tracking-widest">
                Code ramassage {o.pickupCode}
              </p>
            </div>
          ))}
        </div>
      </main>
    </RequireRole>
  );
}
