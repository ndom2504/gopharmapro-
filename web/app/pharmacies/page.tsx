import { PharmacyCard } from '@/components/PharmacyCard';
import { getPublicPharmacies } from '@/lib/catalog';

export const metadata = { title: 'Pharmacies' };
export const dynamic = 'force-dynamic';

export default function PharmaciesPage() {
  const pharmacies = getPublicPharmacies();
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Pharmacies vérifiées</h1>
      <p className="mt-2 max-w-xl text-muted">
        Seules les officines validées par l’administration apparaissent ici. Les dossiers en attente restent
        invisibles sur la marketplace.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {pharmacies.map((p) => (
          <PharmacyCard key={p.id} pharmacy={p} />
        ))}
      </div>
    </main>
  );
}
