'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { CatalogProductImage } from '@/components/CatalogProductImage';
import { isClient } from '@/lib/accounts';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  fulfillmentLabel: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  pharmacy: { name: string };
  paymentReady?: boolean;
  paymentMessage?: string | null;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    prescriptionRequired: boolean;
    imageUrl: string | null;
    imageAlt: string | null;
  }[];
  prescription: { status: string; statusLabel: string; note: string | null } | null;
};

export default function ClientOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { session } = useShop();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    fetch(`/api/v1/orders/${params.id}`)
      .then((r) => r.json())
      .then((data: { order?: Order; error?: string }) => {
        if (data.error || !data.order) setError(data.error || 'Commande introuvable.');
        else {
          setError('');
          setOrder(data.order);
        }
      })
      .catch(() => setError('Commande introuvable.'));
  };

  useEffect(() => {
    if (!isClient(session)) return;
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, country: session.country }),
    }).then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, params.id]);

  const upload = async () => {
    if (!file || !order) return;
    setBusy(true);
    const form = new FormData();
    form.set('file', file);
    const res = await fetch(`/api/v1/orders/${order.id}/prescription`, { method: 'POST', body: form });
    const data = (await res.json()) as { order?: Order; error?: string };
    setBusy(false);
    if (!res.ok) setError(data.error || 'Envoi impossible.');
    else setOrder(data.order || order);
  };

  const cancel = async () => {
    if (!order) return;
    setBusy(true);
    const res = await fetch(`/api/v1/orders/${order.id}/cancel`, { method: 'POST' });
    const data = (await res.json()) as { order?: Order; error?: string };
    setBusy(false);
    if (!res.ok) setError(data.error || 'Annulation impossible.');
    else setOrder(data.order || order);
  };

  if (!order) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm font-bold text-muted">{error || 'Chargement…'}</main>;
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard/client/orders" className="text-sm font-extrabold text-brand">
        ← Mes commandes
      </Link>
      <p className="mt-4 text-sm font-extrabold text-brand">✓ Commande enregistrée</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{order.orderNumber}</h1>
      <p className="mt-2 text-sm font-extrabold">{order.statusLabel}</p>
      <p className="text-sm text-muted">{order.pharmacy.name} · {order.fulfillmentLabel}</p>
      {order.paymentReady ? <p className="mt-3 text-sm font-extrabold text-brand-dark">{order.paymentMessage}</p> : null}
      {error ? <p className="mt-3 text-sm font-bold text-danger">{error}</p> : null}

      <section className="card mt-6 space-y-4 p-5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <CatalogProductImage src={item.imageUrl} alt={item.imageAlt || item.productName} size="thumb" />
            <div>
              <p className="font-extrabold">{item.productName}</p>
              <p className="text-sm text-muted">
                {item.quantity} × {item.unitPrice.toLocaleString('fr-FR')} {order.currency}
              </p>
              {item.prescriptionRequired ? <p className="text-sm font-extrabold text-warning">⚠ Médicament sur ordonnance</p> : null}
            </div>
          </div>
        ))}
        {order.deliveryAddress ? (
          <p className="text-sm text-muted">
            Livraison : {order.deliveryAddress}, {order.deliveryCity}
          </p>
        ) : null}
        <p className="text-sm">Sous-total {order.subtotal.toLocaleString('fr-FR')} {order.currency}</p>
        <p className="text-sm">Livraison {order.deliveryFee.toLocaleString('fr-FR')} {order.currency}</p>
        <p className="font-extrabold">Total {order.total.toLocaleString('fr-FR')} {order.currency}</p>
      </section>

      {order.prescription && (order.status === 'PENDING_PRESCRIPTION' || order.status === 'PRESCRIPTION_REVIEW') ? (
        <section className="card mt-4 space-y-3 p-5">
          <h2 className="font-extrabold">Ordonnance</h2>
          <p className="text-sm text-muted">{order.prescription.statusLabel}</p>
          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="button" className="btn-primary w-full" disabled={!file || busy} onClick={upload}>
            Envoyer l’ordonnance
          </button>
        </section>
      ) : null}

      {order.prescription?.note ? <p className="mt-4 text-sm font-bold text-danger">{order.prescription.note}</p> : null}

      {order.status === 'PENDING_PRESCRIPTION' || order.status === 'PRESCRIPTION_REVIEW' || order.status === 'READY_FOR_PAYMENT' ? (
        <button type="button" className="btn-secondary mt-5" disabled={busy} onClick={cancel}>
          Annuler la commande
        </button>
      ) : null}
    </main>
  );
}
