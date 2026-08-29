import Link from 'next/link';
import { formatKm, type Pharmacy } from '@/lib/catalog';
import { PharmacyFeedback } from '@/components/PharmacyFeedback';

export function PharmacyCard({ pharmacy }: { pharmacy: Pharmacy }) {
  return (
    <div className="card p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-extrabold text-ink">{pharmacy.name}</h3>
        <span className={pharmacy.open ? 'badge-green' : 'badge-red'}>
          {pharmacy.open ? 'Ouverte' : 'Fermée'}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted">
        📍 {formatKm(pharmacy.distance)} · {pharmacy.area}
      </p>
      <p className="mt-1 text-sm font-semibold text-brand">
        {pharmacy.delivery ? '🚚 Livraison disponible' : 'Retrait uniquement'}
      </p>
      <PharmacyFeedback
        pharmacyId={pharmacy.id}
        name={pharmacy.name}
        baseRating={pharmacy.rating}
        reviewCount={pharmacy.reviewCount}
      />
      <Link href={`/pharmacies/${pharmacy.id}`} className="btn-secondary mt-4 inline-flex !h-10 text-sm">
        Voir la pharmacie
      </Link>
    </div>
  );
}
