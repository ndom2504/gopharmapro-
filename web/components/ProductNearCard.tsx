'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatFcfa, formatKm, type Product } from '@/lib/catalog';
import { useShop } from '@/components/ShopProvider';
import { isClient } from '@/lib/accounts';
import { ProductPhoto } from '@/components/ProductPhoto';

export function ProductNearCard({ product }: { product: Product }) {
  const { add, session } = useShop();
  const router = useRouter();
  const [error, setError] = useState('');
  const offer =
    [...product.offers].filter((o) => o.stock > 0).sort((a, b) => a.pharmacy.distance - b.pharmacy.distance)[0] ||
    product.offers[0];
  if (!offer) return null;

  const onAdd = () => {
    if (session && !isClient(session)) {
      setError('Connectez-vous en client pour commander.');
      return;
    }
    const result = add(product, offer);
    if (result === 'different-pharmacy') {
      setError('Le panier est déjà lié à une autre pharmacie.');
      return;
    }
    router.push('/panier');
  };

  return (
    <div className="card flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <ProductPhoto src={product.imageSrc} alt={product.name} size="thumb" />
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-ink">{product.name}</p>
          <p className="mt-1 text-sm font-extrabold text-ink">{formatFcfa(offer.price)}</p>
          <p className="mt-1 text-sm text-muted">
            {offer.pharmacy.name} · {formatKm(offer.pharmacy.distance)}
          </p>
          {error ? <p className="mt-1 text-xs font-bold text-danger">{error}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:w-[148px]">
        <Link href={`/pharmacies/${offer.pharmacy.id}`} className="btn-primary !h-10 !px-3 text-center text-sm">
          Voir pharmacie
        </Link>
        <button type="button" className="btn-secondary !h-10 !px-3 text-sm" onClick={onAdd}>
          Ajouter
        </button>
        <Link href={`/produits/${product.id}`} className="text-center text-xs font-extrabold text-ink">
          Comparer
        </Link>
      </div>
    </div>
  );
}
