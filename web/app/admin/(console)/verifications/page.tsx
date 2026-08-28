import Link from 'next/link';
import { getAdminState } from '@/lib/adminData';

export const metadata = { title: 'Vérifications' };
export const dynamic = 'force-dynamic';

export default function AdminVerificationsPage() {
  const { pharmacies, couriers, catalog } = getAdminState();
  const pendingPh = pharmacies.filter((p) => p.status === 'pending');
  const pendingCo = couriers.filter((c) => c.status === 'pending');
  const review = catalog.filter((i) => i.status === 'review');
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Vérifications</h1>
      <p className="mt-2 text-sm text-muted">Dossiers pharmacies, livreurs et produits à ordonnance.</p>
      <section className="mt-8">
        <h2 className="font-extrabold text-ink">Pharmacies</h2>
        <div className="mt-3 space-y-3">
          {pendingPh.length === 0 ? <p className="text-sm text-muted">Aucune officine en attente.</p> : null}
          {pendingPh.map((p) => (
            <Link key={p.id} href={`/admin/pharmacies/${p.id}`} className="card block p-5">
              <p className="font-extrabold text-ink">{p.pharmacyName}</p>
              <span className="badge-orange mt-2 inline-flex">En attente</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-extrabold text-ink">Livreurs</h2>
        <div className="mt-3 space-y-3">
          {pendingCo.length === 0 ? <p className="text-sm text-muted">Aucun livreur en attente.</p> : null}
          {pendingCo.map((c) => (
            <div key={c.id} className="card p-5">
              <p className="font-extrabold text-ink">
                {c.firstName} {c.lastName}
              </p>
              <span className="badge-orange mt-2 inline-flex">En attente</span>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="font-extrabold text-ink">Produits</h2>
        <div className="mt-3 space-y-3">
          {review.map((i) => (
            <div key={i.id} className="card p-5">
              <p className="font-extrabold text-ink">{i.name}</p>
              <p className="text-sm text-muted">{i.pharmacyName} · ordonnance</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
