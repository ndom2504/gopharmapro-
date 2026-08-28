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
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Commandes</h1>
        <div className="mt-6 space-y-3">
          {jobs.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex justify-between gap-3">
                <p className="font-extrabold text-ink">#{o.id}</p>
                <span className="badge-green">{statusLabel[o.status] || o.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{formatFcfa(o.total)}</p>
              {o.items.map((i) => (
                <p key={i.name} className="text-sm text-muted">
                  {i.name} × {i.quantity}
                </p>
              ))}
              <p className="mt-3 font-extrabold tracking-widest text-brand">Code ramassage {o.pickupCode}</p>
            </div>
          ))}
        </div>
      </main>
    </RequireRole>
  );
}
