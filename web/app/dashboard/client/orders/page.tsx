'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { isClient } from '@/lib/accounts';

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  total: number;
  currency: string;
  pharmacy: { name: string };
};

export default function ClientOrdersPage() {
  const { session } = useShop();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isClient(session)) return;
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, country: session.country, city: session.city, address: session.address }),
    })
      .then(() => fetch('/api/v1/orders'))
      .then((r) => r.json())
      .then((data: { orders?: OrderRow[]; error?: string }) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders || []);
      })
      .catch(() => setError('Commandes indisponibles.'));
  }, [session]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-extrabold text-brand">Commandes</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">Mes commandes</h1>
      {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/dashboard/client/orders/${order.orderNumber}`} className="card block p-5">
            <p className="font-extrabold text-ink">{order.orderNumber}</p>
            <p className="mt-1 text-sm text-muted">{order.pharmacy.name}</p>
            <p className="mt-2 text-sm font-extrabold">{order.statusLabel}</p>
            <p className="text-sm">{order.total.toLocaleString('fr-FR')} {order.currency}</p>
          </Link>
        ))}
        {!orders.length && !error ? <p className="text-sm font-bold text-muted">Aucune commande pour le moment.</p> : null}
      </div>
    </main>
  );
}
