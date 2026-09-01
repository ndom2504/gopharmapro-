'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { isClient } from '@/lib/accounts';
import { countryOf } from '@/lib/places';
import { CatalogProductImage } from '@/components/CatalogProductImage';

type City = { name: string; latitude: number | null; longitude: number | null };
type Result = {
  distanceKm: number | null;
  product: {
    id: string;
    name: string;
    genericName: string | null;
    dosage: string | null;
    pharmaceuticalForm: string | null;
    category: { name: string };
    requiresPrescription: boolean;
    imageUrl?: string | null;
    imageAlt?: string | null;
  };
  pharmacy: { id: string; name: string; city: string | null; address: string | null };
  offer: {
    price: number;
    currency: string;
    stockQuantity: number;
    available: boolean;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
  };
};

const examples = ['Paracétamol', 'Amoxicilline', 'Doliprane', 'Vitamine C'];

export default function ClientDashboardPage() {
  const { session } = useShop();
  const country = countryOf(session && 'country' in session ? session.country : 'GA');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locate, setLocate] = useState<'idle' | 'on' | 'denied'>('idle');
  const [sort, setSort] = useState('relevance');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isClient(session)) return;
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: session.id,
        email: session.email,
        country: session.country || country,
        city: session.city,
        address: session.address,
      }),
    }).catch(() => undefined);
  }, [session, country]);

  useEffect(() => {
    fetch(`/api/v1/client/cities?country=${country}`)
      .then((r) => r.json())
      .then((data: { cities?: City[] }) => setCities(data.cities || []))
      .catch(() => setCities([]));
  }, [country]);

  const run = async (term = search) => {
    setBusy(true);
    setError('');
    const params = new URLSearchParams({ country, sort });
    if (term.trim()) params.set('search', term.trim());
    if (category.trim()) params.set('category', category.trim());
    if (city && locate !== 'on') params.set('city', city);
    if (coords && locate === 'on') {
      params.set('latitude', String(coords.latitude));
      params.set('longitude', String(coords.longitude));
    }
    try {
      const res = await fetch(`/api/v1/client/products/search?${params}`);
      const data = (await res.json()) as { results?: Result[]; error?: string };
      if (!res.ok) {
        setError(data.error || 'Recherche impossible.');
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch {
      setError('Recherche impossible.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    run(search).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country, sort, city, locate, coords?.latitude, coords?.longitude, category]);

  const askLocation = () => {
    if (!navigator.geolocation) {
      setLocate('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocate('on');
        setCity('');
      },
      () => setLocate('denied'),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  };

  const categories = useMemo(() => [...new Set(results.map((r) => r.product.category.name))], [results]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-brand">Recherche</p>
          <h1 className="mt-1 text-3xl font-extrabold text-ink">Que recherchez-vous ?</h1>
        </div>
        <Link href="/dashboard/client/cart" className="btn-secondary shrink-0">
          🛒 Panier
        </Link>
      </div>
      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
          run(q);
        }}
      >
        <input
          className="h-12 flex-1 rounded-2xl border border-border px-4 font-semibold"
          placeholder="Rechercher un médicament ou produit de santé"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Rechercher
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            className="rounded-full border border-border px-3 py-1.5 text-sm font-bold text-muted"
            onClick={() => {
              setQ(ex);
              setSearch(ex);
              run(ex);
            }}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${locate === 'on' ? 'bg-brand text-black' : 'border border-border bg-white text-muted'}`} onClick={askLocation}>
            Ma localisation
          </button>
          <select
            className="h-10 rounded-full border border-border px-3 text-sm font-bold"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setLocate('idle');
            }}
          >
            <option value="">Choisir une ville</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <select className="h-10 rounded-full border border-border px-3 text-sm font-bold" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="relevance">Pertinence</option>
          <option value="price">Prix le plus bas</option>
          <option value="nearest">Plus proche</option>
          <option value="availability">Disponibilité</option>
        </select>
      </div>
      {locate === 'denied' ? <p className="mt-2 text-xs font-bold text-muted">Localisation refusée. La recherche continue par pays ou ville.</p> : null}

      {categories.length > 1 ? (
        <select className="mt-3 h-10 rounded-full border border-border px-3 text-sm font-bold" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : null}

      {error ? <p className="mt-4 text-sm font-bold text-danger">{error}</p> : null}
      {busy ? <p className="mt-4 text-sm font-bold text-muted">Recherche…</p> : null}

      <div className="mt-6 space-y-3">
        {results.map((r) => (
          <article key={`${r.pharmacy.id}-${r.product.id}`} className="card flex items-start gap-4 p-5">
            <CatalogProductImage src={r.product.imageUrl} alt={r.product.imageAlt || r.product.name} size="card" />
            <div className="min-w-0 flex-1">
            <h2 className="font-extrabold text-ink">{r.product.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {r.product.genericName || '—'} · {r.product.dosage || '—'} · {r.product.pharmaceuticalForm || '—'} · {r.product.category.name}
            </p>
            <p className="mt-3 font-extrabold text-ink">{r.pharmacy.name}</p>
            <p className="text-sm text-muted">
              {r.distanceKm != null ? `📍 ${String(r.distanceKm).replace('.', ',')} km` : r.pharmacy.city ? `📍 ${r.pharmacy.city}` : '📍'}
              {r.pharmacy.address ? ` · ${r.pharmacy.address}` : ''}
            </p>
            <p className="mt-2 text-lg font-extrabold text-ink">
              {r.offer.price.toLocaleString('fr-FR')} {r.offer.currency}
            </p>
            <p className="text-sm font-bold text-brand-dark">
              {r.offer.available ? '✓ Disponible' : 'Indisponible'} · Stock {r.offer.stockQuantity}
            </p>
            <p className="mt-1 text-sm text-muted">
              {r.offer.deliveryAvailable ? '✓ Livraison' : 'Livraison indisponible'} · {r.offer.pickupAvailable ? '✓ Retrait en pharmacie' : 'Retrait indisponible'}
            </p>
            {r.product.requiresPrescription ? (
              <p className="mt-2 text-sm font-extrabold text-warning">⚠ Médicament sur ordonnance</p>
            ) : null}
            <Link href={`/dashboard/client/pharmacy/${r.pharmacy.id}/product/${r.product.id}`} className="btn-primary mt-4 inline-flex">
              Voir l&apos;offre
            </Link>
            </div>
          </article>
        ))}
        {!busy && !results.length ? <p className="text-sm font-bold text-muted">Aucune offre disponible pour cette recherche.</p> : null}
      </div>
    </main>
  );
}
