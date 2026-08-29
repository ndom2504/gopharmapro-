import { ProductCard } from '@/components/ProductCard';
import { SearchForm } from '@/components/SearchForm';
import { categories, searchProducts } from '@/lib/catalog';
import Link from 'next/link';

export const metadata = { title: 'Produits' };
export const dynamic = 'force-dynamic';

function hrefFor(next: { q?: string; cat?: string; rx?: boolean }) {
  const p = new URLSearchParams();
  if (next.q) p.set('q', next.q);
  if (next.cat) p.set('cat', next.cat);
  if (next.rx) p.set('rx', '1');
  const s = p.toString();
  return s ? `/produits?${s}` : '/produits';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; rx?: string }>;
}) {
  const { q = '', cat = '', rx } = await searchParams;
  const prescription = rx === '1' || rx === 'true';
  const list = searchProducts(q, { category: cat || undefined, prescription: prescription || undefined });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Rechercher un médicament</h1>
      <p className="mt-2 text-muted">
        Comparez les pharmacies disponibles : prix, distance et stock. Puis commandez.
      </p>
      <div className="mt-6">
        <SearchForm defaultValue={q} category={cat} prescription={prescription} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={hrefFor({ q, rx: prescription })}
          className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
            !cat ? 'border-brand bg-mint text-brand-dark' : 'border-border bg-white text-muted'
          }`}
        >
          Tous
        </Link>
        {categories.map((c) => (
          <Link
            key={c.name}
            href={hrefFor({ q, cat: c.name, rx: prescription })}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
              cat === c.name ? 'border-brand bg-mint text-brand-dark' : 'border-border bg-white text-muted'
            }`}
          >
            {c.name}
          </Link>
        ))}
        <Link
          href={hrefFor({ q, cat, rx: !prescription })}
          className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
            prescription ? 'border-[#F5C2C7] bg-[#FFF0F0] text-danger' : 'border-border bg-white text-muted'
          }`}
        >
          Ordonnance
        </Link>
      </div>
      <p className="mt-4 text-sm font-bold text-muted">
        {list.length} produit{list.length > 1 ? 's' : ''}
        {cat ? ` · ${cat}` : ''}
        {prescription ? ' · sur ordonnance' : ''}
        {q ? ` · « ${q} »` : ''}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.length ? (
          list.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="text-muted">
            {q
              ? `Aucun produit ne correspond à « ${q} ».`
              : cat
                ? `Aucun produit dans « ${cat} ».`
                : prescription
                  ? 'Aucun produit sur ordonnance pour le moment.'
                  : 'Aucun produit.'}
          </p>
        )}
      </div>
    </main>
  );
}
