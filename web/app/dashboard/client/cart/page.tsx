'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { CatalogProductImage } from '@/components/CatalogProductImage';
import { isClient } from '@/lib/accounts';

type CartItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currency: string;
  stockQuantity: number;
  prescriptionRequired: boolean;
  product: { name: string; genericName: string | null; dosage: string | null; pharmaceuticalForm: string | null; imageUrl: string | null; imageAlt: string | null };
  pharmacy: { id: string; name: string };
};

type CartPayload = {
  itemCount: number;
  subtotal: number;
  currency: string;
  groups: { pharmacy: { id: string; name: string }; items: CartItem[]; subtotal: number }[];
};

export default function ClientCartPage() {
  const router = useRouter();
  const { session } = useShop();
  const [cart, setCart] = useState<CartPayload | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    const res = await fetch('/api/v1/cart');
    const data = (await res.json()) as { cart?: CartPayload; error?: string };
    if (!res.ok) {
      setError(data.error || 'Panier indisponible.');
      setCart(null);
      return;
    }
    setError('');
    setCart(data.cart || null);
  };

  useEffect(() => {
    if (!isClient(session)) return;
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: session.id,
        country: session.country,
        city: session.city,
        address: session.address,
      }),
    })
      .then(() => load())
      .catch(() => setError('Panier indisponible.'));
  }, [session]);

  const changeQty = async (id: string, quantity: number) => {
    setBusy(id);
    const res = await fetch(`/api/v1/cart/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
    });
    const data = (await res.json()) as { cart?: CartPayload; error?: string };
    setBusy('');
    if (!res.ok) setError(data.error || 'Quantité impossible.');
    else setCart(data.cart || null);
  };

  const remove = async (id: string) => {
    setBusy(id);
    const res = await fetch(`/api/v1/cart/items/${id}`, { method: 'DELETE' });
    const data = (await res.json()) as { cart?: CartPayload; error?: string };
    setBusy('');
    if (!res.ok) setError(data.error || 'Suppression impossible.');
    else setCart(data.cart || null);
  };

  if (!isClient(session)) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="font-extrabold text-ink">Connectez-vous pour voir votre panier.</p>
        <Link href="/connexion?role=client&next=/dashboard/client/cart" className="btn-primary mt-4 inline-flex">
          Connexion
        </Link>
      </main>
    );
  }

  if (!cart) {
    return <main className="mx-auto max-w-3xl px-4 py-10 text-sm font-bold text-muted">{error || 'Chargement…'}</main>;
  }

  if (!cart.groups.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-extrabold text-ink">Votre panier est vide</h1>
        <Link href="/dashboard/client" className="btn-primary mt-6 inline-flex">
          Rechercher un produit
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <p className="text-sm font-extrabold text-brand">Panier</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">Votre commande</h1>
      {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}

      <div className="mt-6 space-y-5">
        {cart.groups.map((group) => (
          <section key={group.pharmacy.id} className="card p-5">
            <h2 className="font-extrabold text-ink">{group.pharmacy.name}</h2>
            <div className="mt-4 space-y-4">
              {group.items.map((item) => (
                <article key={item.id} className="flex items-start gap-3 border-t border-border pt-4 first:border-0 first:pt-0">
                  <CatalogProductImage src={item.product.imageUrl} alt={item.product.imageAlt || item.product.name} size="thumb" />
                  <div className="min-w-0 flex-1">
                    <p className="font-extrabold text-ink">{item.product.name}</p>
                    <p className="text-sm text-muted">
                      {item.product.dosage || '—'} · {item.product.pharmaceuticalForm || '—'}
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      {item.unitPrice.toLocaleString('fr-FR')} {item.currency}
                    </p>
                    <p className="text-xs font-bold text-muted">Stock {item.stockQuantity}</p>
                    {item.prescriptionRequired ? (
                      <p className="mt-1 text-sm font-extrabold text-warning">⚠ Médicament sur ordonnance</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" className="btn-secondary !h-9 !w-9" disabled={busy === item.id} onClick={() => changeQty(item.id, item.quantity - 1)}>
                        −
                      </button>
                      <span className="min-w-6 text-center font-extrabold">{item.quantity}</span>
                      <button type="button" className="btn-secondary !h-9 !w-9" disabled={busy === item.id} onClick={() => changeQty(item.id, item.quantity + 1)}>
                        +
                      </button>
                      <button type="button" className="text-sm font-extrabold text-danger" onClick={() => remove(item.id)}>
                        Supprimer
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-extrabold">Total : {item.lineTotal.toLocaleString('fr-FR')} {item.currency}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm font-extrabold">Sous-total pharmacie : {group.subtotal.toLocaleString('fr-FR')} {cart.currency}</p>
          </section>
        ))}
      </div>

      <div className="card mt-5 p-5">
        <p className="font-extrabold">Total panier : {cart.subtotal.toLocaleString('fr-FR')} {cart.currency}</p>
        <p className="mt-1 text-sm text-muted">{cart.itemCount} article(s) · une commande sera créée par pharmacie.</p>
        <button type="button" className="btn-primary mt-4 w-full" onClick={() => router.push('/dashboard/client/checkout')}>
          Valider la commande
        </button>
      </div>
    </main>
  );
}
