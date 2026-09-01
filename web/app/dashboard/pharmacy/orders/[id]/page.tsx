'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  fulfillmentLabel: string;
  total: number;
  currency: string;
  notes: string | null;
  customer?: { accountId: string; city: string | null; address: string | null };
  items: { id: string; productName: string; quantity: number; unitPrice: number; totalPrice: number; prescriptionRequired: boolean }[];
  prescription: { status: string; statusLabel: string; documentUrl?: string | null; note: string | null } | null;
};

export default function PharmacyOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { session } = useShop();
  const [order, setOrder] = useState<Order | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = () => {
    fetch(`/api/v1/pharmacy/orders/${params.id}`)
      .then((r) => r.json())
      .then((data: { order?: Order; error?: string }) => {
        if (data.error || !data.order) setError(data.error || 'Commande introuvable.');
        else setOrder(data.order);
      })
      .catch(() => setError('Commande introuvable.'));
  };

  useEffect(() => {
    if (!isPharmacy(session)) return;
    fetch('/api/v1/pharmacies/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, email: session.email }),
    }).then(load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, params.id]);

  const review = async (action: 'approve' | 'reject') => {
    if (!order) return;
    setBusy(action);
    const res = await fetch(`/api/v1/pharmacy/orders/${order.id}/${action}-prescription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    const data = (await res.json()) as { order?: Order; error?: string };
    setBusy('');
    if (!res.ok) setError(data.error || 'Action impossible.');
    else setOrder(data.order || order);
  };

  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <Link href="/dashboard/pharmacy/orders" className="text-sm font-extrabold text-brand">
          ← Commandes
        </Link>
        {!order ? (
          <p className="mt-6 text-sm font-bold text-muted">{error || 'Chargement…'}</p>
        ) : (
          <>
            <h1 className="mt-3 text-3xl font-extrabold text-ink">{order.orderNumber}</h1>
            <p className="mt-2 text-sm font-extrabold">{order.statusLabel}</p>
            <p className="text-sm text-muted">
              Client {order.customer?.accountId || '—'} · {order.fulfillmentLabel}
            </p>
            {order.customer?.address ? <p className="text-sm text-muted">{order.customer.address}, {order.customer.city}</p> : null}
            {error ? <p className="mt-3 text-sm font-bold text-danger">{error}</p> : null}
            <section className="card mt-5 p-5">
              {order.items.map((item) => (
                <p key={item.id} className="text-sm">
                  {item.productName} × {item.quantity} — {item.totalPrice.toLocaleString('fr-FR')} {order.currency}
                  {item.prescriptionRequired ? ' · ordonnance' : ''}
                </p>
              ))}
              <p className="mt-3 font-extrabold">Montant {order.total.toLocaleString('fr-FR')} {order.currency}</p>
              {order.notes ? <p className="mt-2 text-sm text-muted">Note client : {order.notes}</p> : null}
            </section>
            {order.prescription ? (
              <section className="card mt-4 space-y-3 p-5">
                <h2 className="font-extrabold">Ordonnance</h2>
                <p className="text-sm">{order.prescription.statusLabel}</p>
                {order.prescription.documentUrl ? (
                  <a href={order.prescription.documentUrl} target="_blank" rel="noreferrer" className="btn-secondary inline-flex">
                    Voir ordonnance
                  </a>
                ) : (
                  <p className="text-sm text-muted">Document pas encore envoyé.</p>
                )}
                {order.status === 'PRESCRIPTION_REVIEW' ? (
                  <>
                    <textarea className="min-h-20 w-full rounded-2xl border border-border p-3 font-semibold" placeholder="Note (obligatoire en cas de refus)" value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="flex gap-2">
                      <button type="button" className="btn-primary" disabled={Boolean(busy)} onClick={() => review('approve')}>
                        Approuver
                      </button>
                      <button type="button" className="btn-secondary" disabled={Boolean(busy)} onClick={() => review('reject')}>
                        Refuser
                      </button>
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}
          </>
        )}
      </main>
    </RequireRole>
  );
}
