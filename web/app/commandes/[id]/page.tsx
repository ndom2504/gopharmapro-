'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';
import { OrderTimeline } from '@/components/OrderTimeline';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useShop();
  const order = orders.find((o) => o.id === id);
  if (!order) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Commande introuvable</h1>
        <Link href="/commandes" className="btn-primary mt-8 inline-flex">
          Mes commandes
        </Link>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Link href="/commandes" className="text-sm font-extrabold text-brand">
        ← Commandes
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Commande #{order.id}</h1>
      <span className="badge-green mt-3 inline-flex">Paiement confirmé</span>
      <div className="card mt-6 p-5">
        <OrderTimeline status={order.status} fulfillment={order.fulfillment} />
      </div>
      {order.fulfillment === 'delivery' ? (
        <div className="card mt-6 p-5 text-center">
          <p className="text-sm font-extrabold text-muted">Suivre ma livraison</p>
          <p className="mt-4 font-extrabold text-ink">📍 Pharmacie</p>
          <p className="my-1 text-muted">↓</p>
          <p className="text-2xl">🚚</p>
          <p className="my-1 text-muted">↓</p>
          <p className="font-extrabold text-ink">👤 Client</p>
          <p className="mt-4 text-sm font-extrabold text-ink">Votre livreur</p>
          <p className="text-lg font-extrabold">Jean M.</p>
          <p className="mt-1 text-sm text-muted">🚚 En route vers vous</p>
          <p className="text-sm text-muted">📍 1,8 km</p>
          <p className="text-sm text-muted">⏱️ Arrivée estimée : 15 min</p>
          {order.status !== 'delivered' ? (
            <p className="mt-4 font-extrabold tracking-[0.3em] text-brand">Code 739204</p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            <a href="tel:+24166000000" className="btn-secondary">
              Appeler le livreur
            </a>
            <a href="mailto:contact@gopharmapro.com" className="btn-secondary">
              Contacter le support
            </a>
          </div>
        </div>
      ) : null}
      <div className="card mt-6 p-5">
        {order.items.map((i) => (
          <p key={i.name} className="flex justify-between gap-3 py-1 font-semibold">
            <span>
              {i.name} × {i.quantity}
            </span>
            <span>{formatFcfa(i.price * i.quantity)}</span>
          </p>
        ))}
        <p className="mt-4 text-lg font-extrabold">{formatFcfa(order.total)}</p>
        <p className="mt-1 text-sm text-muted">
          {order.paymentLabel} · {order.fulfillment === 'delivery' ? 'Livraison' : 'Retrait en officine'}
        </p>
      </div>
    </main>
  );
}
