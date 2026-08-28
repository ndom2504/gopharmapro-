import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatFcfa, formatKm, getPharmacy, pharmacies, productsForPharmacy } from '@/lib/catalog';

export function generateStaticParams() {
  return pharmacies.map((p) => ({ id: p.id }));
}

export default async function PharmacyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
        ★ {pharmacy.rating} · {formatKm(pharmacy.distance)} · {pharmacy.eta}
      </p>
      <p className="text-muted">{pharmacy.area}</p>
      <div className="card mt-6 p-5 text-sm leading-6 text-muted">
        <p>{pharmacy.delivery ? `Livraison · frais ${formatFcfa(pharmacy.fee)}` : 'Retrait uniquement'}</p>
        <p>Retrait en officine {pharmacy.pickup ? 'disponible' : 'indisponible'}.</p>
      </div>
      <h2 className="mt-10 text-xl font-extrabold text-ink">Produits en stock</h2>
      <div className="mt-4 grid gap-3">
        {catalog.map((p) => {
          const offer = p.offers.find((o) => o.pharmacy.id === pharmacy.id);
          return (
            <Link key={p.id} href={`/produits/${p.id}`} className="card flex items-center justify-between p-4">
              <div>
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
