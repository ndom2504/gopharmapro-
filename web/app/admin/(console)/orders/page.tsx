import { getAdminState } from '@/lib/adminData';
import { formatFcfa } from '@/lib/catalog';

export const metadata = { title: 'Commandes' };
export const dynamic = 'force-dynamic';

const labels: Record<string, string> = {
  paid: 'Payée',
  preparing: 'Préparation',
  ready: 'Prête',
  picked_up: 'Récupérée',
  delivered: 'Livrée',
};

export default function AdminOrdersPage() {
  const { orders } = getAdminState();
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Commandes</h1>
      <p className="mt-2 text-sm text-muted">
        Encaissement par Go Pharma Pro, puis répartition : pharmacie 92 %, plateforme 8 %, livreur = frais de
        livraison.
      </p>
      <div className="mt-6 space-y-3">
        {orders.length === 0 ? <p className="text-sm text-muted">Aucune commande pour le moment.</p> : null}
        {orders.map((o) => (
          <div key={o.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-extrabold text-ink">#{o.id}</p>
              <span className="badge-green">{labels[o.status] || o.status}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {o.pharmacyName} · {formatFcfa(o.total)}
            </p>
            <p className="text-sm text-muted">
              {o.paymentLabel} · {o.reference}
            </p>
            {o.split ? (
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                <p>
                  <span className="font-extrabold text-ink">Pharmacie</span>
                  <span className="mt-0.5 block text-muted">{formatFcfa(o.split.pharmacyNet)}</span>
                </p>
                <p>
                  <span className="font-extrabold text-ink">Livreur</span>
                  <span className="mt-0.5 block text-muted">{formatFcfa(o.split.courierNet)}</span>
                </p>
                <p>
                  <span className="font-extrabold text-ink">Plateforme 8 %</span>
                  <span className="mt-0.5 block text-muted">{formatFcfa(o.split.platformFee)}</span>
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
