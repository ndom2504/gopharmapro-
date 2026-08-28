import Link from 'next/link';
import { formatKm, type Pharmacy } from '@/lib/catalog';

export function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  return (
    <Link href={`/pharmacies/${pharmacy.id}`} className="card block p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-extrabold text-ink">{pharmacy.name}</h3>
        <span className={pharmacy.open ? 'badge-green' : 'badge-red'}>
          {pharmacy.open ? 'Ouverte' : 'Fermée'}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        ★ {pharmacy.rating} · {formatKm(pharmacy.distance)} · {pharmacy.eta}
      </p>
      <p className="mt-1 text-sm text-muted">{pharmacy.area}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pharmacy.verified ? <span className="badge-green">Vérifiée</span> : null}
        <p className="text-sm font-semibold text-brand">
          {pharmacy.delivery ? 'Livraison disponible' : 'Retrait uniquement'}
        </p>
      </div>
    </Link>
  );
}
