'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';

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
      <h1 className="mt-4 text-3xl font-extrabold text-ink">#{order.id}</h1>
      <span className="badge-green mt-3 inline-flex">{order.status}</span>
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
