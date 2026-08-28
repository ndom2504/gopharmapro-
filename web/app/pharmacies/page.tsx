import { PharmacyCard } from '@/components/PharmacyCard';
import { pharmacies } from '@/lib/catalog';

export const metadata = { title: 'Pharmacies' };

export default function PharmaciesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Pharmacies partenaires</h1>
      <p className="mt-2 max-w-xl text-muted">
        Comparez les officines de Libreville, la livraison et le retrait. Les distances correspondent
        au catalogue de l’application.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {pharmacies.map((p) => (
          <PharmacyCard key={p.id} pharmacy={p} />
        ))}
      </div>
    </main>
  );
}
