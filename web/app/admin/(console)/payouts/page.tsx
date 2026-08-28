import { sendPayout } from '@/app/admin/actions';
import { getAdminState } from '@/lib/adminData';
import { formatFcfa } from '@/lib/catalog';

export const metadata = { title: 'Virements' };
export const dynamic = 'force-dynamic';

export default function AdminPayoutsPage() {
  const { payouts } = getAdminState();
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Virements</h1>
      <p className="mt-2 text-sm text-muted">
        Marquez comme envoyé après le transfert mobile money vers l’officine ou le livreur.
      </p>
      <div className="mt-6 space-y-3">
        {payouts.length === 0 ? <p className="text-sm text-muted">Aucun virement en attente.</p> : null}
        {payouts.map((p) => (
          <div key={p.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-ink">{formatFcfa(p.amount)}</p>
                <p className="mt-1 text-sm text-muted">
                  {p.beneficiary === 'pharmacy' ? 'Pharmacie' : 'Livreur'} · {p.phone}
                </p>
                <p className="text-sm text-muted">Commande {p.orderId}</p>
              </div>
              <span className={p.status === 'sent' ? 'badge-green' : 'badge-orange'}>
                {p.status === 'sent' ? 'Envoyé' : 'À virer'}
              </span>
            </div>
            {p.status === 'pending' ? (
              <form action={sendPayout.bind(null, p.id)} className="mt-4">
                <button type="submit" className="btn-primary !h-10 text-sm">
                  Marquer comme viré
                </button>
              </form>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
