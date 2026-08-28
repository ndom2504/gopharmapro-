import Link from 'next/link';
import { formatFcfa, lowestPrice, type Product } from '@/lib/catalog';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produits/${product.id}`} className="card block p-5 transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-ink">{product.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {product.form} · dès {formatFcfa(lowestPrice(product))}
          </p>
        </div>
        {product.requiresPrescription ? (
          <span className="badge-red">Ordonnance</span>
        ) : (
          <span className="badge-green">Disponible</span>
        )}
      </div>
    </Link>
  );
}
