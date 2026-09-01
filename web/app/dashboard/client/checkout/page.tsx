'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { isClient } from '@/lib/accounts';

type Group = {
  pharmacy: { id: string; name: string };
  items: { id: string; product: { name: string }; quantity: number; lineTotal: number; prescriptionRequired: boolean; deliveryAvailable: boolean; pickupAvailable: boolean }[];
  subtotal: number;
  hasPrescription: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
};

type OrderCreated = { orderNumber: string; status: string; statusLabel: string; pharmacy: { name: string }; total: number; currency: string };

export default function ClientCheckoutPage() {
  const { session } = useShop();
  const [groups, setGroups] = useState<Group[]>([]);
  const [currency, setCurrency] = useState('XAF');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [methods, setMethods] = useState<Record<string, 'PICKUP' | 'DELIVERY'>>({});
  const [useSaved, setUseSaved] = useState(true);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<OrderCreated[] | null>(null);

  useEffect(() => {
    if (!isClient(session)) return;
    setAddress(session.address || '');
    setCity(session.city || '');
    setPhone(session.phone || '');
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, country: session.country, city: session.city, address: session.address }),
    })
      .then(() => fetch('/api/v1/cart'))
      .then((r) => r.json())
      .then((data: { cart?: { groups?: Group[]; currency?: string; deliveryFee?: number }; error?: string }) => {
        if (data.error || !data.cart?.groups?.length) {
          setError(data.error || 'Panier vide.');
          return;
        }
        setGroups(data.cart.groups);
        setCurrency(data.cart.currency || 'XAF');
        setDeliveryFee(Number(data.cart.deliveryFee || 0));
        const next: Record<string, 'PICKUP' | 'DELIVERY'> = {};
        for (const g of data.cart.groups) next[g.pharmacy.id] = g.pickupAvailable ? 'PICKUP' : 'DELIVERY';
        setMethods(next);
      })
      .catch(() => setError('Checkout indisponible.'));
  }, [session]);

  const needsDelivery = groups.some((g) => methods[g.pharmacy.id] === 'DELIVERY');
  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const feeTotal = groups.filter((g) => methods[g.pharmacy.id] === 'DELIVERY').length * deliveryFee;

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fulfillmentByPharmacy: methods,
        useSavedAddress: useSaved,
        deliveryAddress: useSaved && isClient(session) ? session.address : address,
        deliveryCity: useSaved && isClient(session) ? session.city : city,
        deliveryPhone: phone,
        deliveryLatitude: coords?.latitude,
        deliveryLongitude: coords?.longitude,
        notes,
      }),
    });
    const data = (await res.json()) as { orders?: OrderCreated[]; error?: string };
    setBusy(false);
    if (!res.ok || !data.orders?.length) {
      setError(data.error || 'Commande impossible.');
      return;
    }
    setCreated(data.orders);
  };

  if (!isClient(session)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/connexion?role=client&next=/dashboard/client/checkout" className="btn-primary inline-flex">
          Connexion
        </Link>
      </main>
    );
  }

  if (created) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm font-extrabold text-brand">✓ Commande enregistrée</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Vos commandes</h1>
        <div className="mt-6 space-y-3">
          {created.map((order) => (
            <article key={order.orderNumber} className="card p-5">
              <p className="font-extrabold text-ink">Commande : {order.orderNumber}</p>
              <p className="mt-1 text-sm text-muted">{order.pharmacy.name}</p>
              <p className="mt-2 text-sm font-extrabold">{order.statusLabel}</p>
              <p className="text-sm">{order.total.toLocaleString('fr-FR')} {order.currency}</p>
              {order.status === 'READY_FOR_PAYMENT' ? (
                <p className="mt-3 text-sm font-extrabold text-brand-dark">Votre commande est prête pour le paiement.</p>
              ) : null}
              <Link href={`/dashboard/client/orders/${order.orderNumber}`} className="btn-secondary mt-4 inline-flex">
                Voir la commande
              </Link>
            </article>
          ))}
        </div>
        <Link href="/dashboard/client/orders" className="btn-primary mt-6 inline-flex">
          Mes commandes
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard/client/cart" className="text-sm font-extrabold text-brand">
        ← Panier
      </Link>
      <h1 className="mt-3 text-3xl font-extrabold text-ink">Validation</h1>
      {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}

      {groups.map((group) => (
        <section key={group.pharmacy.id} className="card mt-5 p-5">
          <h2 className="font-extrabold">{group.pharmacy.name}</h2>
          {group.items.map((item) => (
            <p key={item.id} className="mt-2 text-sm text-muted">
              {item.product.name} × {item.quantity} — {item.lineTotal.toLocaleString('fr-FR')} {currency}
              {item.prescriptionRequired ? ' · ⚠ ordonnance' : ''}
            </p>
          ))}
          <p className="mt-3 text-sm font-extrabold">Sous-total : {group.subtotal.toLocaleString('fr-FR')} {currency}</p>
          <p className="mt-4 text-sm font-extrabold">Mode de réception</p>
          {group.pickupAvailable ? (
            <label className="mt-2 flex items-center gap-2 text-sm font-bold">
              <input type="radio" checked={methods[group.pharmacy.id] === 'PICKUP'} onChange={() => setMethods((m) => ({ ...m, [group.pharmacy.id]: 'PICKUP' }))} />
              Retrait en pharmacie
            </label>
          ) : null}
          {group.deliveryAvailable ? (
            <label className="mt-2 flex items-center gap-2 text-sm font-bold">
              <input type="radio" checked={methods[group.pharmacy.id] === 'DELIVERY'} onChange={() => setMethods((m) => ({ ...m, [group.pharmacy.id]: 'DELIVERY' }))} />
              Livraison
            </label>
          ) : null}
          {group.hasPrescription ? (
            <p className="mt-3 text-sm font-extrabold text-warning">⚠ Cette commande restera en attente d’ordonnance.</p>
          ) : null}
        </section>
      ))}

      {needsDelivery ? (
        <section className="card mt-5 space-y-3 p-5">
          <h2 className="font-extrabold">Adresse de livraison</h2>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={useSaved} onChange={(e) => setUseSaved(e.target.checked)} />
            Utiliser mon adresse enregistrée
          </label>
          {!useSaved ? (
            <>
              <input className="h-11 w-full rounded-2xl border border-border px-3 font-semibold" placeholder="Adresse" value={address} onChange={(e) => setAddress(e.target.value)} />
              <input className="h-11 w-full rounded-2xl border border-border px-3 font-semibold" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} />
            </>
          ) : (
            <p className="text-sm text-muted">{session.address || '—'} · {session.city || '—'}</p>
          )}
          <input className="h-11 w-full rounded-2xl border border-border px-3 font-semibold" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button type="button" className="btn-secondary" onClick={locate}>
            Utiliser ma position (optionnel)
          </button>
          {coords ? <p className="text-xs font-bold text-muted">Position enregistrée pour cette commande uniquement.</p> : null}
        </section>
      ) : null}

      <textarea className="mt-5 min-h-24 w-full rounded-2xl border border-border p-3 font-semibold" placeholder="Note pour la pharmacie (optionnel)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div className="card mt-5 p-5">
        <p className="text-sm">Sous-total : {subtotal.toLocaleString('fr-FR')} {currency}</p>
        <p className="text-sm">Frais de livraison : {feeTotal.toLocaleString('fr-FR')} {currency}</p>
        <p className="mt-2 font-extrabold">Total : {(subtotal + feeTotal).toLocaleString('fr-FR')} {currency}</p>
        <p className="mt-2 text-xs text-muted">Les prix sont recalculés côté serveur. Le paiement n’est pas encore ouvert.</p>
        <button type="button" className="btn-primary mt-4 w-full" disabled={busy || !groups.length} onClick={submit}>
          {busy ? 'Envoi…' : 'Envoyer la commande'}
        </button>
      </div>
    </main>
  );
}
