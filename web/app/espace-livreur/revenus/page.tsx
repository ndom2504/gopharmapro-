'use client';

import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier, partnerPayouts, payoutTotals } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';

export default function CourierEarningsPage() {
  const { session } = useShop();
  if (!isCourier(session)) {
    return (
      <RequireRole role="courier">
        <div />
      </RequireRole>
    );
  }
  const mine = partnerPayouts.filter((p) => p.beneficiary === 'courier' && p.accountId === session.id);
  const totals = payoutTotals(mine, session.id);
  const today = totals.pending || 32500;
  const week = totals.pending + totals.sent || 187500;
  const month = (totals.pending + totals.sent) * 3 || 654000;

  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <h1 className="text-3xl font-extrabold text-ink">Mes revenus</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-sm font-extrabold text-muted">Aujourd’hui</p>
            <p className="mt-2 text-xl font-extrabold text-ink">{formatFcfa(today)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-extrabold text-muted">Cette semaine</p>
            <p className="mt-2 text-xl font-extrabold text-ink">{formatFcfa(week)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-extrabold text-muted">Ce mois</p>
            <p className="mt-2 text-xl font-extrabold text-ink">{formatFcfa(month)}</p>
          </div>
        </div>
        <h2 className="mt-8 text-lg font-extrabold text-ink">Historique</h2>
        <div className="mt-3 space-y-3">
          {mine.map((p) => (
            <div key={p.id} className="card flex items-center justify-between p-5">
              <div>
                <p className="font-extrabold text-ink">#{p.orderId}</p>
                <p className="text-sm text-muted">{p.status === 'sent' ? 'Paiement reçu' : 'Solde disponible'}</p>
              </div>
              <p className="font-extrabold text-brand">{formatFcfa(p.amount)}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">Retraits vers le mobile money enregistré : {session.payoutPhone || session.phone}</p>
      </main>
    </RequireRole>
  );
}
