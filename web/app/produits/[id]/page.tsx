import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatFcfa, getProduct, products } from '@/lib/catalog';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/produits" className="text-sm font-extrabold text-brand">
        ← Produits
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{product.name}</h1>
          <p className="mt-2 text-muted">
            {product.genericName} · {product.dosage} · {product.form}
          </p>
        </div>
        {product.requiresPrescription ? (
          <span className="badge-red">Ordonnance</span>
        ) : (
          <span className="badge-green">Sans ordonnance</span>
        )}
      </div>
      <p className="mt-6 leading-7 text-muted">{product.description}</p>
      {product.requiresPrescription ? (
        <p className="card mt-4 bg-red-50 p-4 text-sm font-semibold text-danger">
          Paiement bloqué jusqu’à validation de l’ordonnance par la pharmacie.
        </p>
      ) : null}
      <h2 className="mt-10 text-xl font-extrabold text-ink">Comparer les pharmacies</h2>
      <div className="mt-4 grid gap-3">
        {product.offers.map((o) => (
          <Link key={o.id} href={`/pharmacies/${o.pharmacy.id}`} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-extrabold text-ink">{o.pharmacy.name}</p>
              <p className="text-sm text-muted">
                {o.pharmacy.area} · {o.stock > 0 ? `${o.stock} en stock` : 'Rupture'}
              </p>
            </div>
            <p className={`font-extrabold ${o.stock > 0 ? 'text-brand' : 'text-muted'}`}>{formatFcfa(o.price)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
