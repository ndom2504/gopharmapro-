'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { colors } from '@/lib/site';
import { formatFcfa, methodsForCountry } from '@/lib/catalog';
import { cartCount, cartSubtotal } from '@/lib/cartMoney';
import { homeFor, isClient } from '@/lib/accounts';
import { cartRxGate, rxPayBlocked, usePrescriptions } from '@/lib/prescriptions';

function parseCheckoutPhone(input: string, country: string) {
  let digits = input.replace(/\D/g, '');
  if (country === 'BJ') {
    if (digits.startsWith('229')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (!/^[4569]\d{7}$/.test(digits)) return null;
    return '+229 ' + (digits.match(/.{1,2}/g)?.join(' ') || digits);
  }
  if (digits.startsWith('241')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[2-7]\d{6,7}$/.test(digits)) return null;
  return '+241 ' + (digits.match(/.{1,2}/g)?.join(' ') || digits);
}

function countryOfPharmacy(pharmacy?: { latitude?: number; longitude?: number; city?: string; area?: string }) {
  if (!pharmacy) return 'GA';
  const lat = pharmacy.latitude || 0;
  const lng = pharmacy.longitude || 0;
  if (lng > 0.7 && lng < 3.9 && lat > 6.2) return 'BJ';
  if (lat > 2.3 && lng > 8.4) return 'CM';
  const text = `${pharmacy.city || ''} ${pharmacy.area || ''}`.toLowerCase();
  if (text.includes('cotonou') || text.includes('porto-novo') || text.includes('parakou') || text.includes('godomey')) return 'BJ';
  return 'GA';
}

function CheckoutForm() {
  const { cart, session, ready } = useShop();
  const { items: rxItems } = usePrescriptions();
  const router = useRouter();
  const [method, setMethod] = useState<string | null>(null);
  const [phone, setPhone] = useState(session && isClient(session) ? session.phone.replace(/^\+\d{3}\s?/, '') : '');
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [error, setError] = useState('');
  const pharmacy = cart[0]?.offer.pharmacy;
  const payCountry = countryOfPharmacy(pharmacy);
  const availableMethods = methodsForCountry(payCountry);
  const canDelivery = !!pharmacy?.delivery;
  const mode = !canDelivery ? 'pickup' : fulfillment;
  const subtotal = cartSubtotal(cart);
  const fee = mode === 'delivery' ? Number(pharmacy?.fee) || 0 : 0;
  const total = subtotal + fee;
  const { gate } = cartRxGate(cart, rxItems, session && isClient(session) ? session.id : undefined);
  const blocked = rxPayBlocked(gate);

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) {
      router.replace(homeFor(session.role));
      return;
    }
    if (cart.length && !session) router.replace('/connexion?next=/commande');
  }, [ready, cart.length, session, router]);

  if (!ready) return null;

  if (!cart.length) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-3xl font-extrabold text-ink">Panier vide</h1>
        <Link href="/produits" className="btn-primary mt-8 inline-flex">
          Voir les produits
        </Link>
      </main>
    );
  }

  if (!session || !isClient(session)) return null;

  const pay = () => {
    setError('');
    if (blocked) {
      setError('Transmettez et faites valider l’ordonnance avant le paiement.');
      return;
    }
    if (!method) {
      setError('Choisissez un moyen de paiement.');
      return;
    }
    if (method === 'card') {
      router.push(`/payer/carte?total=${total}&fulfillment=${mode}`);
      return;
    }
    const parsed = parseCheckoutPhone(phone, payCountry);
    if (!parsed) {
      setError(payCountry === 'BJ' ? 'Entrez un numéro béninois valide, ex. 97 12 34 56.' : 'Entrez un numéro gabonais valide, ex. 77 12 34 56.');
      return;
    }
    if (method === 'geniuspay') {
      router.push(`/payer/geniuspay?phone=${encodeURIComponent(parsed)}&total=${total}&fulfillment=${mode}`);
      return;
    }
    router.push(`/payer?method=${method}&phone=${encodeURIComponent(parsed)}&total=${total}&fulfillment=${mode}`);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Finaliser la commande</h1>
      <p className="mt-2 text-sm text-muted">
        {pharmacy?.name} · {cartCount(cart)} article(s) · sous-total {formatFcfa(subtotal)}
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setFulfillment('pickup')}
          className={`card p-4 text-left font-extrabold ${mode === 'pickup' ? 'border-brand' : ''}`}
        >
          Retrait
        </button>
        <button
          type="button"
          disabled={!canDelivery}
          onClick={() => setFulfillment('delivery')}
          className={`card p-4 text-left font-extrabold disabled:opacity-40 ${mode === 'delivery' ? 'border-brand' : ''}`}
        >
          Livraison {pharmacy?.fee ? `· ${formatFcfa(pharmacy.fee)}` : ''}
        </button>
      </div>
      {blocked ? (
        <div className="card mt-6 border-[#F5C2C7] bg-[#FFF0F0] p-5">
          <p className="font-extrabold text-danger">
            {gate === 'pending' ? 'Ordonnance en cours de validation' : 'Ordonnance requise'}
          </p>
          <Link href="/ordonnances" className="btn-secondary mt-4 inline-flex">
            Gérer l’ordonnance
          </Link>
        </div>
      ) : null}
      <h2 className="mt-8 text-lg font-extrabold text-ink">Paiement</h2>
      <p className="mt-1 text-sm text-muted">
        {payCountry === 'BJ'
          ? 'Au Bénin : GeniusPay (MTN MoMo, Moov Money) ou carte. Le montant est encaissé par Go Pharma Pro.'
          : 'Mobile money, ou carte Visa / Mastercard. Le montant est encaissé par Go Pharma Pro.'}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {availableMethods.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className="card flex items-center gap-3 p-4 text-left"
            style={{ background: m.background, outline: method === m.id ? `2px solid ${colors.primary}` : undefined }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
            <div>
              <p className="font-extrabold text-ink">{m.name}</p>
              <p className="text-sm text-muted">{m.operator}</p>
            </div>
          </button>
        ))}
      </div>
      {method && method !== 'card' ? (
        <label className="mt-6 block">
          <span className="text-sm font-extrabold text-ink">Numéro mobile money</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 h-12 w-full rounded-2xl border border-border px-4 font-semibold outline-none focus:border-brand"
            placeholder={payCountry === 'BJ' ? '97 12 34 56' : '77 12 34 56'}
          />
        </label>
      ) : null}
      {error ? <p className="mt-3 text-sm font-bold text-danger">{error}</p> : null}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-lg font-extrabold text-ink">{formatFcfa(total)}</p>
        <button type="button" className="btn-primary disabled:opacity-40" disabled={blocked} onClick={pay}>
          {blocked ? (gate === 'pending' ? 'En attente de validation' : 'Paiement bloqué') : 'Payer'}
        </button>
      </div>
    </main>
  );
}

export default function CommandePage() {
  return <CheckoutForm />;
}
