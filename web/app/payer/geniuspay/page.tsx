'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';
import { homeFor, isClient } from '@/lib/accounts';

function PayGeniusInner() {
  const params = useSearchParams();
  const phone = params.get('phone') || '';
  const total = Number(params.get('total') || 0);
  const fulfillment = params.get('fulfillment') === 'delivery' ? 'delivery' : 'pickup';
  const status = params.get('status') || '';
  const { cart, placeOrder, ready, session } = useShop();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const done = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);

  const finish = () => {
    if (done.current || !cart.length) return;
    done.current = true;
    const order = placeOrder({ paymentLabel: 'GeniusPay', fulfillment, total });
    if (order) router.replace(`/commandes/${order.id}`);
  };

  useEffect(() => {
    if (status === 'success') finish();
  }, [status]);

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/v1/payments/geniuspay/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          phone,
          name: session && isClient(session) ? `${session.firstName} ${session.lastName}`.trim() : 'Client',
          email: session && isClient(session) ? session.email : undefined,
          returnUrl: window.location.origin + `/payer/geniuspay?total=${total}&fulfillment=${fulfillment}&phone=${encodeURIComponent(phone)}`,
          label: 'Commande Go Pharma Pro',
        }),
      });
      const data = (await res.json()) as { url?: string; demo?: boolean; error?: string };
      if (data.url && !data.demo) {
        window.location.href = data.url;
        return;
      }
      finish();
    } catch {
      setError('Impossible d’ouvrir GeniusPay. Réessayez.');
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length && !done.current && status !== 'success') {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Paiement interrompu</h1>
        <Link href="/produits" className="btn-primary mt-8 inline-flex">
          Retour au catalogue
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <p className="inline-flex rounded-full bg-[#E8F1F8] px-3 py-1 text-sm font-extrabold text-[#0B4F8A]">GeniusPay</p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Payer au Bénin</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        MTN MoMo et Moov Money via GeniusPay. {phone ? `Compte ${phone}.` : ''}
      </p>
      <div className="card mt-8 p-5">
        <p className="text-2xl font-extrabold text-ink">{formatFcfa(total)}</p>
        <p className="mt-1 text-sm text-muted">Marchand Go Pharma Pro · Bénin · XOF</p>
      </div>
      {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
      <button type="button" className="btn-primary mt-8 disabled:opacity-40" disabled={busy} onClick={pay}>
        {busy ? 'Ouverture de GeniusPay…' : `Payer ${formatFcfa(total)}`}
      </button>
    </main>
  );
}

export default function PayerGeniusPage() {
  return (
    <Suspense>
      <PayGeniusInner />
    </Suspense>
  );
}
