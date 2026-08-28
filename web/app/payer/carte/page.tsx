'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa } from '@/lib/catalog';

function formatCardNumber(input: string) {
  return input.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatCardExpiry(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + '/' + digits.slice(2);
}

function isTestCard(number: string, expiry: string, cvc: string) {
  const digits = number.replace(/\D/g, '');
  return digits === '4242424242424242' && expiry.replace(/\D/g, '').length === 4 && /^\d{3}$/.test(cvc);
}

function PayCardInner() {
  const params = useSearchParams();
  const total = Number(params.get('total') || 0);
  const fulfillment = params.get('fulfillment') === 'delivery' ? 'delivery' : 'pickup';
  const { cart, placeOrder } = useShop();
  const router = useRouter();
  const done = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const finish = (label: string) => {
    if (done.current || !cart.length) return;
    done.current = true;
    const order = placeOrder({ paymentLabel: label, fulfillment, total });
    if (order) router.replace(`/commandes/${order.id}`);
  };

  useEffect(() => {
    if (params.get('status') === 'success' && cart.length) finish('Visa · Stripe');
  }, [params, cart.length]);

  const payHosted = async () => {
    setError('');
    setBusy(true);
    try {
      const returnUrl = window.location.origin + '/payer/carte?total=' + total + '&fulfillment=' + fulfillment;
      const res = await fetch('/api/v1/payments/stripe/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, returnUrl, label: 'Commande Go Pharma Pro' }),
      });
      const data = (await res.json()) as { url?: string; demo?: boolean };
      if (data.demo || !data.url) {
        setError('Stripe n’est pas encore configuré. Utilisez la carte de test 4242 4242 4242 4242.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Impossible d’ouvrir Stripe.');
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length && !done.current && params.get('status') !== 'success') {
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
      <h1 className="text-3xl font-extrabold text-ink">Paiement carte</h1>
      <p className="mt-2 text-sm text-muted">{formatFcfa(total)} · Visa / Mastercard (Stripe)</p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isTestCard(number, expiry, cvc)) {
            setError('Carte invalide. En test : 4242 4242 4242 4242, expiration future, CVC à 3 chiffres.');
            return;
          }
          finish('Visa •••• 4242');
        }}
      >
        <label className="block">
          <span className="text-sm font-extrabold">Numéro</span>
          <input
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            className="mt-1 h-12 w-full rounded-2xl border border-border px-4 font-semibold outline-none focus:border-brand"
            placeholder="4242 4242 4242 4242"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-extrabold">Expiration</span>
            <input
              value={expiry}
              onChange={(e) => setExpiry(formatCardExpiry(e.target.value))}
              className="mt-1 h-12 w-full rounded-2xl border border-border px-4 font-semibold outline-none focus:border-brand"
              placeholder="12/28"
            />
          </label>
          <label className="block">
            <span className="text-sm font-extrabold">CVC</span>
            <input
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
              className="mt-1 h-12 w-full rounded-2xl border border-border px-4 font-semibold outline-none focus:border-brand"
              placeholder="123"
            />
          </label>
        </div>
        {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
        <button type="submit" className="btn-primary w-full">
          Payer {formatFcfa(total)}
        </button>
      </form>
      <button type="button" disabled={busy} onClick={payHosted} className="btn-secondary mt-3 w-full">
        {busy ? 'Ouverture Stripe…' : 'Payer via Stripe Checkout'}
      </button>
    </main>
  );
}

export default function PayCardPage() {
  return (
    <Suspense>
      <PayCardInner />
    </Suspense>
  );
}
