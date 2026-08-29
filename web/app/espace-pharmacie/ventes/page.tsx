'use client';

import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy, partnerPayouts, payoutTotals } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';

export default function PharmacySalesPage() {
  const { session } = useShop();
  if (!isPharmacy(session)) {
    return (
      <RequireRole role="pharmacy">
        <div />
      </RequireRole>
    );
  }
  const mine = partnerPayouts.filter((p) => p.beneficiary === 'pharmacy' && p.accountId === session.id);
  const money = payoutTotals(mine, session.id);
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Ventes</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm font-extrabold text-muted">En attente</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">{formatFcfa(money.pending)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-extrabold text-muted">Versé</p>
            <p className="mt-2 text-2xl font-extrabold text-ink">{formatFcfa(money.sent)}</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {mine.map((p) => (
            <div key={p.id} className="card flex min-w-0 justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <p className="break-words font-extrabold text-ink">#{p.orderId}</p>
                <p className="text-sm text-muted">{p.status === 'sent' ? 'Virement envoyé' : 'À virer'}</p>
              </div>
              <p className="shrink-0 font-extrabold text-brand">{formatFcfa(p.amount)}</p>
            </div>
          ))}
        </div>
      </main>
    </RequireRole>
  );
}
