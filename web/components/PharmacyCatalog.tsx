'use client';

import { useCallback, useEffect, useState } from 'react';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';

type PharmacySession = {
  id: string;
  name: string;
  country: { code: string; name: string; currency: string; currencySymbol: string };
};

type Offer = {
  id: string;
  productId: string;
  name: string;
  genericName: string | null;
  category: string;
  dosage: string | null;
  dosageUnit: string | null;
  pharmaceuticalForm: string | null;
  price: number;
  currency: string;
  stockQuantity: number;
  available: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  requiresPrescription: boolean;
};

type CatalogHit = {
  id: string;
  name: string;
  genericName: string | null;
  dosage: string | null;
  pharmaceuticalForm: string | null;
  category: { name: string };
  requiresPrescription: boolean;
  prescriptionRequired?: boolean;
  regulatoryLabel?: string;
};

export function PharmacyCatalog() {
  const { session } = useShop();
  const [pharmacy, setPharmacy] = useState<PharmacySession | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<CatalogHit[]>([]);
  const [picked, setPicked] = useState<CatalogHit | null>(null);
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [available, setAvailable] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);
  const [editing, setEditing] = useState<Offer | null>(null);

  const currency = pharmacy?.country.currencySymbol || pharmacy?.country.currency || 'FCFA';

  const loadOffers = useCallback(async (pharmacyId: string) => {
    const res = await fetch(`/api/v1/pharmacies/${pharmacyId}/products`);
    const data = (await res.json()) as { offers?: Offer[]; error?: string };
    if (!res.ok) {
      setError(data.error || 'Impossible de charger vos produits.');
      return;
    }
    setOffers(data.offers || []);
  }, []);

  useEffect(() => {
    if (!isPharmacy(session)) return;
    fetch('/api/v1/pharmacies/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, email: session.email }),
    })
      .then((r) => r.json())
      .then((data: { pharmacy?: PharmacySession; error?: string }) => {
        if (!data.pharmacy?.id) {
          setError(data.error || 'Pharmacie absente du catalogue central.');
          return;
        }
        setPharmacy(data.pharmacy);
        return loadOffers(data.pharmacy.id);
      })
      .catch(() => setError('Catalogue pharmacie indisponible.'));
  }, [session, loadOffers]);

  const search = async () => {
    if (!pharmacy) return;
    setError('');
    const res = await fetch(
      `/api/v1/catalog/products?country=${pharmacy.country.code}&search=${encodeURIComponent(q.trim())}`,
    );
    const data = (await res.json()) as { products?: CatalogHit[]; error?: string };
    if (!res.ok) {
      setError(data.error || 'Recherche impossible.');
      setHits([]);
      return;
    }
    setHits(data.products || []);
  };

  const saveOffer = async () => {
    if (!pharmacy || !picked) return;
    setBusy('…');
    const res = await fetch(`/api/v1/pharmacies/${pharmacy.id}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: picked.id,
        price: Number(price),
        stockQuantity: Number(stock),
        available,
        deliveryAvailable: delivery,
        pickupAvailable: pickup,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setBusy('');
      setError(data.error || 'Enregistrement impossible.');
      return;
    }
    setBusy('');
    setPicked(null);
    setAdding(false);
    setHits([]);
    setQ('');
    await loadOffers(pharmacy.id);
  };

  const saveEdit = async () => {
    if (!pharmacy || !editing) return;
    setBusy('…');
    const res = await fetch(`/api/v1/pharmacies/${pharmacy.id}/products/${editing.productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price: Number(editing.price),
        stockQuantity: Number(editing.stockQuantity),
        available: editing.available,
        deliveryAvailable: editing.deliveryAvailable,
        pickupAvailable: editing.pickupAvailable,
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setBusy('');
      setError(data.error || 'Modification impossible.');
      return;
    }
    setBusy('');
    setEditing(null);
    await loadOffers(pharmacy.id);
  };

  const removeOffer = async (productId: string) => {
    if (!pharmacy) return;
    setBusy('…');
    const res = await fetch(`/api/v1/pharmacies/${pharmacy.id}/products/${productId}`, { method: 'DELETE' });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setBusy('');
      setError(data.error || 'Retrait impossible.');
      return;
    }
    setBusy('');
    await loadOffers(pharmacy.id);
  };

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <RoleSubnav items={pharmacyNav} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Catalogue de ma pharmacie</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Sélectionnez un produit du catalogue GoPharmaPro, puis définissez uniquement votre prix, stock et
            disponibilité. Vous ne pouvez pas modifier la fiche centrale ni le statut réglementaire.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setAdding(true);
            setPicked(null);
            setError('');
          }}
        >
          + Ajouter un produit
        </button>
      </div>
      {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
      {busy ? <p className="mt-2 text-sm font-bold text-brand-dark">{busy}</p> : null}

      {adding ? (
        <section className="card mt-6 space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-extrabold text-ink">Ajouter depuis le catalogue central</h2>
            <button type="button" className="text-sm font-extrabold text-muted" onClick={() => setAdding(false)}>
              Fermer
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="h-12 flex-1 rounded-2xl border border-border px-4 font-semibold"
              placeholder="Rechercher : Paracétamol"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  search();
                }
              }}
            />
            <button type="button" className="btn-primary" onClick={search}>
              Rechercher
            </button>
          </div>
          <div className="space-y-3">
            {hits.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border p-4">
                <p className="font-extrabold text-ink">{p.name}</p>
                <p className="text-sm text-muted">
                  {p.category.name}
                  {p.pharmaceuticalForm ? ` · ${p.pharmaceuticalForm}` : ''}
                  {p.dosage ? ` · ${p.dosage}` : ''}
                </p>
                {p.requiresPrescription || p.prescriptionRequired ? (
                  <p className="mt-1 text-xs font-extrabold text-brand-dark">Ordonnance : ce produit peut nécessiter une ordonnance.</p>
                ) : null}
                <button
                  type="button"
                  className="btn-secondary mt-3 !h-10 text-sm"
                  onClick={() => {
                    setPicked(p);
                    setPrice('');
                    setStock('');
                    setAvailable(true);
                    setDelivery(true);
                    setPickup(true);
                  }}
                >
                  Ajouter
                </button>
              </div>
            ))}
          </div>
          {picked ? (
            <div className="space-y-3 rounded-2xl border border-border p-4">
              <p className="font-extrabold text-ink">{picked.name}</p>
              <p className="text-sm text-muted">
                {picked.category.name}
                {picked.pharmaceuticalForm ? ` · ${picked.pharmaceuticalForm}` : ''}
              </p>
              {picked.requiresPrescription || picked.prescriptionRequired ? (
                <p className="text-sm font-extrabold text-brand-dark">Ordonnance requise — information du catalogue central, non modifiable ici.</p>
              ) : null}
              <label className="block text-sm font-extrabold">
                Prix
                <div className="mt-1 flex items-center gap-2">
                  <input className="h-12 flex-1 rounded-2xl border border-border px-4" value={price} onChange={(e) => setPrice(e.target.value)} />
                  <span className="text-sm font-bold text-muted">{currency}</span>
                </div>
              </label>
              <label className="block text-sm font-extrabold">
                Stock
                <input className="mt-1 h-12 w-full rounded-2xl border border-border px-4" value={stock} onChange={(e) => setStock(e.target.value)} />
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} /> Disponible
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} /> Livraison
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} /> Retrait en pharmacie
              </label>
              <button type="button" className="btn-primary w-full" onClick={saveOffer}>
                Enregistrer
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs font-extrabold uppercase tracking-wide text-muted">
              <th className="px-3 py-2">Produit</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Dosage</th>
              <th className="px-3 py-2">Prix</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Disponibilité</th>
              <th className="px-3 py-2">Livraison</th>
              <th className="px-3 py-2">Retrait</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-t border-border align-top">
                <td className="px-3 py-3">
                  <p className="font-extrabold text-ink">{o.name}</p>
                  {o.requiresPrescription ? <p className="text-xs font-bold text-brand-dark">Ordonnance possible</p> : null}
                </td>
                <td className="px-3 py-3 text-muted">{o.category}</td>
                <td className="px-3 py-3 text-muted">{o.dosage || '—'}</td>
                <td className="px-3 py-3 font-bold">
                  {editing?.id === o.id ? (
                    <input className="h-10 w-24 rounded-xl border border-border px-2" value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                  ) : (
                    `${o.price} ${o.currency}`
                  )}
                </td>
                <td className="px-3 py-3">
                  {editing?.id === o.id ? (
                    <input className="h-10 w-20 rounded-xl border border-border px-2" value={editing.stockQuantity} onChange={(e) => setEditing({ ...editing, stockQuantity: Number(e.target.value) })} />
                  ) : (
                    o.stockQuantity
                  )}
                </td>
                <td className="px-3 py-3">
                  {editing?.id === o.id ? (
                    <input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} />
                  ) : o.available ? (
                    'Oui'
                  ) : (
                    'Non'
                  )}
                </td>
                <td className="px-3 py-3">
                  {editing?.id === o.id ? (
                    <input type="checkbox" checked={editing.deliveryAvailable} onChange={(e) => setEditing({ ...editing, deliveryAvailable: e.target.checked })} />
                  ) : o.deliveryAvailable ? (
                    'Oui'
                  ) : (
                    'Non'
                  )}
                </td>
                <td className="px-3 py-3">
                  {editing?.id === o.id ? (
                    <input type="checkbox" checked={editing.pickupAvailable} onChange={(e) => setEditing({ ...editing, pickupAvailable: e.target.checked })} />
                  ) : o.pickupAvailable ? (
                    'Oui'
                  ) : (
                    'Non'
                  )}
                </td>
                <td className="px-3 py-3">
                  {editing?.id === o.id ? (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-primary !h-9 text-xs" onClick={saveEdit}>
                        OK
                      </button>
                      <button type="button" className="btn-secondary !h-9 text-xs" onClick={() => setEditing(null)}>
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-secondary !h-9 text-xs" onClick={() => setEditing(o)}>
                        Modifier
                      </button>
                      <button type="button" className="btn-secondary !h-9 text-xs" onClick={() => removeOffer(o.productId)}>
                        Retirer
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!offers.length ? <p className="mt-4 text-sm font-bold text-muted">Aucun produit dans votre offre pour le moment.</p> : null}
      </div>
    </main>
  );
}
