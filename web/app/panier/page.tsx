'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';
import { cartSubtotal, lineTotal } from '@/lib/cartMoney';
import { ProductPhoto } from '@/components/ProductPhoto';
import { homeFor, isClient } from '@/lib/accounts';
import { cartRxGate, rxPayBlocked, rxStatusLabel, usePrescriptions } from '@/lib/prescriptions';

export default function PanierPage() {
  const { cart, change, remove, session, ready } = useShop();
  const { items: rxItems } = usePrescriptions();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);

  if (!ready || (session && !isClient(session))) return null;

  const subtotal = cartSubtotal(cart);
  const { gate, latest } = cartRxGate(cart, rxItems, session && isClient(session) ? session.id : undefined);
  const blocked = rxPayBlocked(gate);
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
      {gate !== 'none' ? (
        <div className={`card mt-4 p-5 ${gate === 'approved' ? 'border-brand/30 bg-mint' : 'border-[#F5C2C7] bg-[#FFF0F0]'}`}>
          <p className={`font-extrabold ${gate === 'approved' ? 'text-ink' : 'text-danger'}`}>
            {gate === 'approved'
              ? 'Ordonnance validée'
              : gate === 'pending'
                ? 'Ordonnance en cours de validation'
                : gate === 'rejected'
                  ? 'Ordonnance refusée'
                  : 'Ce produit nécessite une ordonnance.'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {gate === 'approved'
              ? 'La pharmacie a accepté le fichier. Vous pouvez payer.'
              : gate === 'pending'
                ? 'Le paiement s’ouvrira dès que la pharmacie aura validé le fichier' +
                  (latest ? ' (' + rxStatusLabel[latest.status] + ').' : '.')
                : gate === 'rejected'
                  ? latest?.note || 'Transmettez un fichier lisible.'
                  : 'Paiement désactivé jusqu’à validation de l’ordonnance.'}
          </p>
          {gate !== 'approved' ? (
            <Link href="/ordonnances" className="btn-secondary mt-4 inline-flex">
              {gate === 'pending' ? 'Suivre l’ordonnance' : gate === 'rejected' ? 'Renvoyer mon ordonnance' : 'Ajouter mon ordonnance'}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="mt-8 flex justify-end">
        {blocked ? (
          <button type="button" disabled className="btn-primary opacity-40">
            {gate === 'pending' ? 'En attente de validation' : 'Paiement bloqué'}
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
