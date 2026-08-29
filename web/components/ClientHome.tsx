'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchForm } from '@/components/SearchForm';
import { ProductNearCard } from '@/components/ProductNearCard';
import { PharmacyCard } from '@/components/PharmacyCard';
import { categories, type Pharmacy, type Product } from '@/lib/catalog';
import { CategoryTile } from '@/components/ProductPhoto';
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
      (pos) => {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        if (lng < 5) setArea('Cotonou, Bénin');
        else if (lat > 2.3) setArea(lng > 10.5 ? 'Yaoundé, Cameroun' : 'Douala, Cameroun');
        else setArea('Libreville, Gabon');
      },
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
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryTile key={c.name} href={`/produits?cat=${encodeURIComponent(c.name)}`} src={c.image} name={c.name} />
          ))}
          <CategoryTile href="/pharmacies" name="Pharmacies proches" icon="🏥" />
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-[19px] font-extrabold text-ink">Pharmacies proches</h2>
          <Link href="/pharmacies" className="text-sm font-extrabold text-ink">
            Voir tout
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pharmacies.slice(0, 2).map((p) => (
            <PharmacyCard key={p.id} pharmacy={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 mb-20 max-w-6xl px-4 sm:px-6">
        <h2 className="text-[19px] font-extrabold text-ink">Produits disponibles près de vous</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {products.slice(0, 8).map((p) => (
            <ProductNearCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
