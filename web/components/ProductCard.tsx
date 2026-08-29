import Link from 'next/link';
import { formatFcfa, lowestPrice, type Product } from '@/lib/catalog';
import { ProductPhoto } from '@/components/ProductPhoto';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produits/${product.id}`} className="card block overflow-hidden p-0 transition hover:-translate-y-0.5">
      <ProductPhoto src={product.imageSrc} alt={product.name} size="card" />
      <div className="flex items-start justify-between gap-3 bg-mint px-3 py-2.5">
        <div>
          <h3 className="font-extrabold text-ink">{product.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {product.form} · dès {formatFcfa(lowestPrice(product))}
          </p>
        </div>
        {product.requiresPrescription ? (
          <span className="badge-red">Ordonnance</span>
        ) : (
          <span className="rounded-full border border-border bg-[#F6F8F7] px-2.5 py-1 text-xs font-extrabold text-ink">
            Disponible
          </span>
        )}
      </div>
    </Link>
  );
}
