'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { formatFcfa, paymentMethods } from '@/lib/catalog';

function PayInner() {
  const params = useSearchParams();
  const method = paymentMethods.find((m) => m.id === params.get('method')) || paymentMethods[1];
  const phone = params.get('phone') || '';
  const total = Number(params.get('total') || 0);
  const fulfillment = params.get('fulfillment') === 'delivery' ? 'delivery' : 'pickup';
  const { cart, placeOrder, ready } = useShop();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const done = useRef(false);
  const placeRef = useRef(placeOrder);
  const cartRef = useRef(cart);
  placeRef.current = placeOrder;
  cartRef.current = cart;

  useEffect(() => {
    if (!ready) return;
    if (!cartRef.current.length) return;
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 2200);
    const t3 = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      const order = placeRef.current({ paymentLabel: method.name, fulfillment, total });
      if (order) router.replace(`/commandes/${order.id}`);
    }, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [ready, fulfillment, method.name, router, total]);

  if (!cart.length && !done.current) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Paiement interrompu</h1>
        <Link href="/produits" className="btn-primary mt-8 inline-flex">
          Retour au catalogue
        </Link>
      </main>
    );
  }

  const steps = ['Demande envoyée à ' + method.operator, 'Validez avec votre code PIN', 'Confirmation du paiement'];

  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <p className="inline-flex rounded-full px-3 py-1 text-sm font-extrabold" style={{ background: method.background, color: method.color }}>
        {method.name}
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Confirmez sur votre téléphone</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Un message {method.name} est envoyé au {phone}.
      </p>
      <div className="card mt-8 p-5">
        <p className="text-2xl font-extrabold text-ink">{formatFcfa(total)}</p>
        <p className="mt-1 text-sm text-muted">Marchand Go Pharma Pro · Gabon</p>
        <ul className="mt-5 space-y-2 text-sm font-semibold text-muted">
          {steps.map((s, i) => (
            <li key={s} className={i <= step ? 'text-brand' : ''}>
              {i <= step ? '●' : '○'} {s}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default function PayerPage() {
  return (
    <Suspense>
      <PayInner />
    </Suspense>
  );
}
