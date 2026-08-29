import Link from 'next/link';
import { formatFcfa, lowestPrice, type Product } from '@/lib/catalog';
import { ProductPhoto } from '@/components/ProductPhoto';
import { RegulatoryBadge } from '@/components/RegulatoryBadge';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produits/${product.id}`} className="card block overflow-hidden p-0 transition hover:-translate-y-0.5">
      <ProductPhoto src={product.imageSrc} alt={product.name} size="card" />
      <div className="flex items-start justify-between gap-3 bg-mint px-3 py-2.5">
        <div>
          <h3 className="font-extrabold text-ink">{product.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {product.category}
            {product.subcategory ? ` · ${product.subcategory}` : ''}
          </p>
          <p className="mt-0.5 text-sm text-muted">
            {product.form} · dès {formatFcfa(lowestPrice(product))}
          </p>
        </div>
        <RegulatoryBadge status={product.regulatoryStatus} requiresPrescription={product.requiresPrescription} />
      </div>
    </Link>
  );
}
