'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Offer, Product } from '@/lib/catalog';
import { formatFcfa } from '@/lib/catalog';
import { useShop } from '@/components/ShopProvider';
import { isClient } from '@/lib/accounts';

export function OfferCart({ product }: { product: Product }) {
  const { add, session } = useShop();
  const router = useRouter();
  const [error, setError] = useState('');

  const onAdd = (offer: Offer) => {
    if (session && !isClient(session)) {
      setError('Le catalogue se commande avec un compte client.');
      return;
    }
    const result = add(product, offer);
    if (result === 'different-pharmacy') {
      setError('Le panier est déjà lié à une autre pharmacie. Videz-le pour commander ici.');
      return;
    }
    if (result === 'partner') {
      setError('Le catalogue se commande avec un compte client.');
      return;
    }
    router.push('/panier');
  };

  return (
    <div className="mt-4 grid gap-3">
      {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
      {product.offers.map((o) => (
        <div key={o.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="font-extrabold text-ink">{o.pharmacy.name}</p>
            <p className="text-sm text-muted">
              {o.pharmacy.area} · {o.stock > 0 ? `${o.stock} en stock` : 'Rupture'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className={`font-extrabold ${o.stock > 0 ? 'text-brand' : 'text-muted'}`}>{formatFcfa(o.price)}</p>
            <button
              type="button"
              disabled={!o.stock}
              onClick={() => onAdd(o)}
              className="btn-primary !h-10 text-sm disabled:opacity-40"
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
