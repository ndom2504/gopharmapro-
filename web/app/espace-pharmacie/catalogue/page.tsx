'use client';

import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';

type CatalogProduct = {
  id: string;
  name: string;
  genericName: string | null;
  dosage: string | null;
  dosageUnit: string | null;
  pharmaceuticalForm: string | null;
  category: { name: string };
  requiresPrescription: boolean;
  regulatory: { status: string; verified: boolean };
};

export default function PharmacyCataloguePage() {
  const { session } = useShop();
  const [q, setQ] = useState('paracetamol');
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [pharmacyId, setPharmacyId] = useState('');
  const [error, setError] = useState('');
  const [picked, setPicked] = useState<CatalogProduct | null>(null);
  const [price, setPrice] = useState('1500');
  const [stock, setStock] = useState('10');
  const [available, setAvailable] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const [pickup, setPickup] = useState(true);

  useEffect(() => {
    if (!isPharmacy(session)) return;
    fetch('/api/v1/pharmacies/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, email: session.email }),
    })
      .then((r) => r.json())
      .then((data: { pharmacy?: { id: string }; error?: string }) => {
        if (data.pharmacy?.id) setPharmacyId(data.pharmacy.id);
        else setError(data.error || 'Catalogue central indisponible.');
      })
      .catch(() => setError('Catalogue central indisponible.'));
  }, [session]);

  const search = async () => {
    setError('');
    const country = isPharmacy(session) && session.country ? session.country : 'GA';
    const res = await fetch(`/api/v1/catalog/products/search?country=${country}&q=${encodeURIComponent(q)}`);
    const data = (await res.json()) as { products?: CatalogProduct[]; error?: string };
    if (!res.ok) {
      setError(data.error || 'Recherche impossible.');
      setProducts([]);
      return;
    }
    setProducts(data.products || []);
  };

  const add = async () => {
    if (!picked || !pharmacyId) return;
    setError('');
    const res = await fetch(`/api/v1/pharmacies/${pharmacyId}/products`, {
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
      setError(data.error || 'Ajout impossible.');
      return;
    }
    setPicked(null);
    setError('Produit ajouté à votre offre.');
  };

  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Catalogue Gopharmapro</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Vous ne créez pas de fiche médicament. Choisissez un produit du catalogue, puis indiquez votre prix, stock et
          options.
        </p>
        <div className="mt-6 flex gap-2">
          <input className="h-12 flex-1 rounded-2xl border border-border px-4 font-semibold" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Paracétamol" />
          <button type="button" className="btn-primary" onClick={search}>
            Rechercher
          </button>
        </div>
        {error ? <p className="mt-3 text-sm font-bold text-danger">{error}</p> : null}
        <div className="mt-6 space-y-3">
          {products.map((p) => (
            <div key={p.id} className="card p-4">
              <p className="font-extrabold text-ink">{p.name}</p>
              <p className="text-sm text-muted">
                {p.category.name} · Ordonnance : {p.requiresPrescription ? 'Oui (selon configuration)' : 'Non'} · Statut{' '}
                {p.regulatory.status}
                {p.regulatory.verified ? ' · vérifié' : ' · non vérifié'}
              </p>
              <button type="button" className="btn-secondary mt-3 !h-10 text-sm" onClick={() => setPicked(p)}>
                Ajouter à ma pharmacie
              </button>
            </div>
          ))}
        </div>
        {picked ? (
          <div className="card mt-6 space-y-3 p-5">
            <p className="font-extrabold text-ink">{picked.name}</p>
            <label className="block text-sm font-extrabold">
              Prix (FCFA)
              <input className="mt-1 h-12 w-full rounded-2xl border border-border px-4" value={price} onChange={(e) => setPrice(e.target.value)} />
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
            <button type="button" className="btn-primary w-full" onClick={add}>
              Enregistrer l’offre
            </button>
          </div>
        ) : null}
      </main>
    </RequireRole>
  );
}
