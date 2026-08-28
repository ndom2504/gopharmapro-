import Link from 'next/link';
import { getPublicPharmacies } from '@/lib/catalog';

export default function FavorisPage() {
  const pharmacies = getPublicPharmacies().slice(0, 1);
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mes favoris</h1>
      <p className="mt-2 text-sm text-muted">Pharmacies et produits sauvegardés.</p>
      <div className="mt-8 space-y-3">
        {pharmacies.map((p) => (
          <Link key={p.id} href={`/pharmacies/${p.id}`} className="card block p-5">
            <p className="font-extrabold text-ink">{p.name} ❤️</p>
            <p className="text-sm text-muted">{p.area}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
