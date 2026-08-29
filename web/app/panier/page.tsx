'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';
import { cartSubtotal, lineTotal } from '@/lib/cartMoney';
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

  const subtotal = cartSubtotal(cart);
  const rx = cart.some((i) => i.product.requiresPrescription);
  const fee = cart[0]?.offer.pharmacy.delivery ? Number(cart[0].offer.pharmacy.fee) || 0 : 0;
  const total = subtotal + fee;
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
      <h1 className="text-3xl font-extrabold text-ink">Mon panier</h1>
      <p className="mt-2 text-sm text-muted">{cart[0].offer.pharmacy.name}</p>
      <div className="mt-6 space-y-3">
        {cart.map((i) => (
          <div key={i.offer.id} className="card flex items-center gap-4 p-4">
            <ProductPhoto src={i.product.imageSrc} alt={i.product.name} size="thumb" />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-ink">{i.product.name}</p>
              <p className="text-sm text-muted">
                {formatFcfa(i.offer.price)} × {i.quantity} = {formatFcfa(lineTotal(i.offer.price, i.quantity))}
              </p>
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
      <div className="card mt-8 space-y-2 p-5">
        <p className="flex justify-between text-sm font-bold text-muted">
          <span>Sous-total</span>
          <span>{formatFcfa(subtotal)}</span>
        </p>
        <p className="flex justify-between text-sm font-bold text-muted">
          <span>Livraison</span>
          <span>{formatFcfa(fee)}</span>
        </p>
        <p className="flex justify-between text-lg font-extrabold text-ink">
          <span>TOTAL</span>
          <span>{formatFcfa(total)}</span>
        </p>
      </div>
      {rx ? (
        <div className="card mt-4 border-[#F5C2C7] bg-[#FFF0F0] p-5">
          <p className="font-extrabold text-danger">Ce produit nécessite une ordonnance.</p>
          <p className="mt-1 text-sm text-muted">Paiement désactivé jusqu’à validation de l’ordonnance.</p>
          <Link href="/ordonnances" className="btn-secondary mt-4 inline-flex">
            Ajouter mon ordonnance
          </Link>
        </div>
      ) : null}
      <div className="mt-8 flex justify-end">
        {rx ? (
          <button type="button" disabled className="btn-primary opacity-40">
            Paiement bloqué
          </button>
        ) : (
          <Link href="/commande" className="btn-primary">
            Commander
          </Link>
        )}
      </div>
    </main>
  );
}
