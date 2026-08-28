import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getProduct, resolveProductId } from '@/lib/catalog';
import { ProductPhoto } from '@/components/ProductPhoto';
import { OfferCart } from '@/components/OfferCart';

export const dynamic = 'force-dynamic';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const canonical = resolveProductId(id);
  if (canonical !== id) redirect(`/produits/${canonical}`);
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/produits" className="text-sm font-extrabold text-brand">
        ← Produits
      </Link>
      <div className="mt-6">
        <ProductPhoto src={product.imageSrc} alt={product.name} size="hero" />
      </div>
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
      <h2 className="mt-10 text-xl font-extrabold text-ink">Choisir une pharmacie</h2>
      <OfferCart product={product} />
    </main>
  );
}
