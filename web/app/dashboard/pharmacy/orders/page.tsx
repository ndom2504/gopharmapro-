'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  fulfillmentLabel: string;
  total: number;
  currency: string;
  customer?: { accountId: string };
  items: { productName: string; quantity: number }[];
};

export default function PharmacyDashboardOrdersPage() {
  const { session } = useShop();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isPharmacy(session)) return;
    fetch('/api/v1/pharmacies/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, email: session.email }),
    })
      .then(() => fetch('/api/v1/pharmacy/orders'))
      .then((r) => r.json())
      .then((data: { orders?: OrderRow[]; error?: string }) => {
        if (data.error) setError(data.error);
        else setOrders(data.orders || []);
      })
      .catch(() => setError('Commandes indisponibles.'));
  }, [session]);

  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Commandes pharmacie</h1>
        {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
        <div className="mt-6 space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/dashboard/pharmacy/orders/${order.orderNumber}`} className="card block p-5">
              <p className="font-extrabold">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-muted">Client {order.customer?.accountId || '—'}</p>
              <p className="mt-2 text-sm font-extrabold">{order.statusLabel}</p>
              <p className="text-sm">{order.fulfillmentLabel} · {order.total.toLocaleString('fr-FR')} {order.currency}</p>
              {order.items.map((item) => (
                <p key={item.productName + item.quantity} className="text-sm text-muted">
                  {item.productName} × {item.quantity}
                </p>
              ))}
            </Link>
          ))}
          {!orders.length && !error ? <p className="text-sm font-bold text-muted">Aucune commande reçue.</p> : null}
        </div>
      </main>
    </RequireRole>
  );
}
