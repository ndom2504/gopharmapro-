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
    <div className="card flex items-center gap-4 p-4">
      <ProductPhoto src={product.imageSrc} alt={product.name} size="thumb" />
      <div className="min-w-0 flex-1">
        <p className="font-extrabold text-ink">{product.name}</p>
        <p className="mt-1 text-sm font-extrabold text-brand">{formatFcfa(offer.price)}</p>
        <p className="mt-1 text-sm text-muted">
          🏥 {offer.pharmacy.name} · 📍 {formatKm(offer.pharmacy.distance)}
        </p>
        {error ? <p className="mt-1 text-xs font-bold text-danger">{error}</p> : null}
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" className="btn-primary !h-10 !px-4 text-sm" onClick={onAdd}>
          Ajouter
        </button>
        <Link href={`/produits/${product.id}`} className="text-center text-xs font-extrabold text-brand">
          Comparer
        </Link>
      </div>
    </div>
  );
}
