'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/SearchForm';
import { ProductNearCard } from '@/components/ProductNearCard';
import { categories, formatKm, type Pharmacy, type Product } from '@/lib/catalog';
import { CategoryPhoto } from '@/components/ProductPhoto';
import { useShop } from '@/components/ShopProvider';
import { displayName, homeFor, isClient } from '@/lib/accounts';

export function ClientHome({ pharmacies, products }: { pharmacies: Pharmacy[]; products: Product[] }) {
  const { session, ready } = useShop();
  const router = useRouter();
  const [area, setArea] = useState('Libreville, Gabon');

  useEffect(() => {
    if (!ready) return;
    if (session && !isClient(session)) router.replace(homeFor(session.role));
  }, [ready, session, router]);

  if (ready && session && !isClient(session)) return null;

  const hello = session && isClient(session) ? `Bonjour ${displayName(session)} 👋` : 'Bonjour 👋';

  const useLocation = () => {
    if (!navigator.geolocation) {
      setArea('Libreville, Gabon');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setArea('Libreville, Gabon'),
      () => setArea('Libreville, Gabon'),
    );
  };

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-lg font-extrabold text-ink">{hello}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Que recherchez-vous aujourd’hui ?
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Cherchez votre médicament, comparez les pharmacies disponibles (prix, distance, stock), puis commandez.
        </p>
        <div className="mt-6">
          <SearchForm />
        </div>
        <div className="card mt-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs font-extrabold tracking-wide text-muted uppercase">Votre position</p>
            <p className="mt-1 font-extrabold text-ink">📍 {area}</p>
          </div>
          <button type="button" className="btn-secondary !h-10 text-sm" onClick={useLocation}>
            Utiliser ma position
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-[19px] font-extrabold text-ink">Catégories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((c) => (
            <Link key={c.name} href={`/produits?q=${encodeURIComponent(c.name)}`} className="card overflow-hidden p-0">
              <CategoryPhoto src={c.image} alt={c.name} />
              <span className="block p-3 font-extrabold text-ink">
                {c.icon} {c.name}
              </span>
            </Link>
          ))}
          <Link href="/pharmacies" className="card flex flex-col items-center justify-center p-4 text-center">
            <span className="text-3xl">🏥</span>
            <span className="mt-2 font-extrabold text-ink">Pharmacies proches</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-[19px] font-extrabold text-ink">Pharmacies proches</h2>
          <Link href="/pharmacies" className="text-sm font-extrabold text-brand">
            Voir tout
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pharmacies.slice(0, 2).map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-extrabold text-ink">{p.name}</h3>
                <span className={p.open ? 'badge-green' : 'badge-red'}>{p.open ? 'Ouverte' : 'Fermée'}</span>
              </div>
              <p className="mt-2 text-sm text-muted">📍 {formatKm(p.distance)}</p>
              <p className="mt-1 text-sm font-semibold text-brand">
                {p.delivery ? '🚚 Livraison disponible' : 'Retrait uniquement'}
              </p>
              <Link href={`/pharmacies/${p.id}`} className="btn-secondary mt-4 inline-flex !h-10 text-sm">
                Voir la pharmacie
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 mb-20 max-w-6xl px-4 sm:px-6">
        <h2 className="text-[19px] font-extrabold text-ink">Produits disponibles près de vous</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {products.slice(0, 4).map((p) => (
            <ProductNearCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
