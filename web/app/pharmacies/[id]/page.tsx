import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { formatFcfa, formatKm, getPharmacy, productsForPharmacy, resolvePharmacyId } from '@/lib/catalog';
import { ProductPhoto } from '@/components/ProductPhoto';
import { PharmacyFeedback } from '@/components/PharmacyFeedback';

export const dynamic = 'force-dynamic';

export default async function PharmacyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const canonical = resolvePharmacyId(id);
  if (canonical !== id) {
    const live = getPharmacy(canonical);
    if (live) redirect(`/pharmacies/${canonical}`);
    notFound();
  }
  const pharmacy = getPharmacy(id);
  if (!pharmacy) notFound();
  const catalog = productsForPharmacy(pharmacy.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/pharmacies" className="text-sm font-extrabold text-brand">
        ← Pharmacies
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-ink">{pharmacy.name}</h1>
        <span className={pharmacy.open ? 'badge-green' : 'badge-red'}>
          {pharmacy.open ? 'Ouverte' : 'Fermée'}
        </span>
      </div>
      <p className="mt-3 text-muted">
        {formatKm(pharmacy.distance)} · {pharmacy.eta}
      </p>
      <p className="text-muted">{pharmacy.area}</p>
      <PharmacyFeedback
        pharmacyId={pharmacy.id}
        name={pharmacy.name}
        baseRating={pharmacy.rating}
        reviewCount={pharmacy.reviewCount}
      />
      <div className="mt-3">
        <span className="badge-green">Vérifiée</span>
      </div>
      <div className="card mt-6 p-5 text-sm leading-6 text-muted">
        <p>{pharmacy.delivery ? `Livraison · frais ${formatFcfa(pharmacy.fee)}` : 'Retrait uniquement'}</p>
        <p>Retrait en officine {pharmacy.pickup ? 'disponible' : 'indisponible'}.</p>
      </div>
      <h2 className="mt-10 text-xl font-extrabold text-ink">Produits en stock</h2>
      <div className="mt-4 grid gap-3">
        {catalog.length === 0 ? (
          <p className="text-sm text-muted">Aucun produit publié pour le moment.</p>
        ) : null}
        {catalog.map((p) => {
          const offer = p.offers.find((o) => o.pharmacy.id === pharmacy.id);
          return (
            <Link key={p.id} href={`/produits/${p.id}`} className="card flex items-center gap-4 p-4">
              <ProductPhoto src={p.imageSrc} alt={p.name} size="thumb" />
              <div className="flex-1">
                <p className="font-extrabold text-ink">{p.name}</p>
                <p className="text-sm text-muted">{p.form}</p>
              </div>
              <p className="font-extrabold text-brand">{offer ? formatFcfa(offer.price) : ''}</p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
