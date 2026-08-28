import { ProductCard } from '@/components/ProductCard';
import { SearchForm } from '@/components/SearchForm';
import { categories, searchProducts } from '@/lib/catalog';
import Link from 'next/link';

export const metadata = { title: 'Produits' };
export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const list = searchProducts(q);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Rechercher un produit</h1>
      <p className="mt-2 text-muted">Les prix affichés viennent des pharmacies déjà validées par l’administration.</p>
      <div className="mt-6">
        <SearchForm defaultValue={q} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link
            key={c.name}
            href={`/produits?q=${encodeURIComponent(c.name)}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
              q === c.name ? 'border-brand bg-mint text-brand-dark' : 'border-border bg-white text-muted'
            }`}
          >
            {c.icon} {c.name}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {list.length ? (
          list.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="text-muted">Aucun produit ne correspond à « {q} ».</p>
        )}
      </div>
    </main>
  );
}
