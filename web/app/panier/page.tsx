'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';
import { ProductPhoto } from '@/components/ProductPhoto';
import { homeFor, isClient } from '@/lib/accounts';

export default function PanierPage() {
  const { cart, change, remove, session, ready } = useShop();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);

  if (!ready || (session && !isClient(session))) return null;

  const subtotal = cart.reduce((a, i) => a + i.offer.price * i.quantity, 0);
  if (!cart.length) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-ink">Votre panier est vide</h1>
        <p className="mt-2 text-muted">Ajoutez un produit depuis le catalogue, comme dans l’application.</p>
        <Link href="/produits" className="btn-primary mt-8 inline-flex">
          Voir les produits
        </Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Panier</h1>
      <p className="mt-2 text-sm text-muted">{cart[0].offer.pharmacy.name}</p>
      <div className="mt-6 space-y-3">
        {cart.map((i) => (
          <div key={i.offer.id} className="card flex items-center gap-4 p-4">
            <ProductPhoto src={i.product.imageSrc} alt={i.product.name} size="thumb" />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-ink">{i.product.name}</p>
              <p className="text-sm text-muted">{formatFcfa(i.offer.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary !h-9 !px-3" onClick={() => change(i.offer.id, -1)}>
                −
              </button>
              <span className="w-6 text-center font-extrabold">{i.quantity}</span>
              <button type="button" className="btn-secondary !h-9 !px-3" onClick={() => change(i.offer.id, 1)}>
                +
              </button>
            </div>
            <button type="button" className="text-sm font-extrabold text-danger" onClick={() => remove(i.offer.id)}>
              Retirer
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <p className="text-lg font-extrabold text-ink">{formatFcfa(subtotal)}</p>
        <Link href="/commande" className="btn-primary">
          Finaliser la commande
        </Link>
      </div>
    </main>
  );
}
