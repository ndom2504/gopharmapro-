'use client';

import Link from 'next/link';
import { getPublicPharmacies } from '@/lib/catalog';
import { PharmacyFeedback, useLikedPharmacies } from '@/components/PharmacyFeedback';

export default function FavorisPage() {
  const likes = useLikedPharmacies();
  const pharmacies = getPublicPharmacies().filter((p) => likes.includes(p.id));

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mes favoris</h1>
      <p className="mt-2 text-sm text-muted">Pharmacies que vous avez aimées.</p>
      <div className="mt-8 space-y-3">
        {pharmacies.length === 0 ? <p className="text-sm text-muted">Aucune pharmacie favorite.</p> : null}
        {pharmacies.map((p) => (
          <div key={p.id} className="card p-5">
            <Link href={`/pharmacies/${p.id}`} className="font-extrabold text-ink">
              {p.name}
            </Link>
            <p className="text-sm text-muted">{p.area}</p>
            <PharmacyFeedback pharmacyId={p.id} name={p.name} baseRating={p.rating} reviewCount={p.reviewCount} />
          </div>
        ))}
      </div>
    </main>
  );
}
