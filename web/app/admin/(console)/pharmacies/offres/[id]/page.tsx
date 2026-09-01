import { notFound } from 'next/navigation';
import Link from 'next/link';
import { catalogDbAvailable } from '@/lib/prisma';
import { getPharmacyById, listPharmacyOffers, serializePharmacy, serializePharmacyOffer } from '@/lib/catalog/pharmacyQueries';

export const dynamic = 'force-dynamic';

export default async function AdminPharmacyOffersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!catalogDbAvailable()) notFound();
  let pharmacy;
  try {
    pharmacy = await getPharmacyById(id);
  } catch {
    notFound();
  }
  const offers = await listPharmacyOffers(pharmacy.id);
  const view = serializePharmacy(pharmacy, { includeContact: true });
  const rows = offers.map(serializePharmacyOffer);

  return (
    <div>
      <Link href="/admin/pharmacies" className="text-sm font-extrabold text-brand">
        ← Pharmacies
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold text-ink">{view.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {view.city || '—'} · {view.country.name} · Catalogue commercial (prix / stock / disponibilité)
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-extrabold uppercase tracking-wide text-muted">
              <th className="px-3 py-2">Produit</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Dosage</th>
              <th className="px-3 py-2">Prix</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Disponible</th>
              <th className="px-3 py-2">Livraison</th>
              <th className="px-3 py-2">Retrait</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-3 py-3 font-extrabold text-ink">{o.name}</td>
                <td className="px-3 py-3 text-muted">{o.category}</td>
                <td className="px-3 py-3 text-muted">{o.dosage || '—'}</td>
                <td className="px-3 py-3 font-bold">
                  {o.price} {o.currency}
                </td>
                <td className="px-3 py-3">{o.stockQuantity}</td>
                <td className="px-3 py-3">{o.available ? 'Oui' : 'Non'}</td>
                <td className="px-3 py-3">{o.deliveryAvailable ? 'Oui' : 'Non'}</td>
                <td className="px-3 py-3">{o.pickupAvailable ? 'Oui' : 'Non'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? <p className="mt-4 text-sm font-bold text-muted">Aucune offre pour cette pharmacie.</p> : null}
      </div>
    </div>
  );
}
