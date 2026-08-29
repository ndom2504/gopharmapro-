import { ProductCard } from '@/components/ProductCard';
import { SearchForm } from '@/components/SearchForm';
import { categories, searchProducts } from '@/lib/catalog';
import { regulatoryStatuses, subcategoriesOf, type RegulatoryStatus } from '@/lib/taxonomy';
import Link from 'next/link';

export const metadata = { title: 'Produits' };
export const dynamic = 'force-dynamic';

function hrefFor(next: { q?: string; cat?: string; sub?: string; rx?: string }) {
  const p = new URLSearchParams();
  if (next.q) p.set('q', next.q);
  if (next.cat) p.set('cat', next.cat);
  if (next.sub) p.set('sub', next.sub);
  if (next.rx) p.set('rx', next.rx);
  const s = p.toString();
  return s ? `/produits?${s}` : '/produits';
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; sub?: string; rx?: string }>;
}) {
  const { q = '', cat = '', sub = '', rx = '' } = await searchParams;
  const status = (['otc', 'rx', 'controlled', 'rx-any'].includes(rx) ? rx : undefined) as
    | RegulatoryStatus
    | 'rx-any'
    | undefined;
  const list = searchProducts(q, { category: cat || undefined, subcategory: sub || undefined, status });
  const subs = cat ? subcategoriesOf(cat) : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-ink">Rechercher un médicament</h1>
      <p className="mt-2 text-muted">
        Filtrez par catégorie commerciale, puis par statut réglementaire. Les deux ne se confondent pas.
      </p>
      <div className="mt-6">
        <SearchForm defaultValue={q} category={cat} subcategory={sub} rx={rx} />
      </div>
      <p className="mt-5 text-xs font-extrabold tracking-wide text-muted uppercase">Catégorie</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={hrefFor({ q, rx })}
          className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
            !cat ? 'border-brand bg-mint text-brand-dark' : 'border-border bg-white text-muted'
          }`}
        >
          Toutes
        </Link>
        {categories.map((c) => (
          <Link
            key={c.name}
            href={hrefFor({ q, cat: c.name, rx })}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
              cat === c.name ? 'border-brand bg-mint text-brand-dark' : 'border-border bg-white text-muted'
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {subs.length ? (
        <>
          <p className="mt-4 text-xs font-extrabold tracking-wide text-muted uppercase">Sous-catégorie</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={hrefFor({ q, cat, rx })}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
                !sub ? 'border-ink bg-ink text-white' : 'border-border bg-white text-muted'
              }`}
            >
              Toutes
            </Link>
            {subs.map((name) => (
              <Link
                key={name}
                href={hrefFor({ q, cat, sub: name, rx })}
                className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
                  sub === name ? 'border-ink bg-ink text-white' : 'border-border bg-white text-muted'
                }`}
              >
                {name}
              </Link>
            ))}
          </div>
        </>
      ) : null}
      <p className="mt-4 text-xs font-extrabold tracking-wide text-muted uppercase">Statut réglementaire</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          href={hrefFor({ q, cat, sub })}
          className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
            !rx ? 'border-border bg-white text-ink' : 'border-border bg-white text-muted'
          }`}
        >
          Tous
        </Link>
        {regulatoryStatuses.map((s) => (
          <Link
            key={s.id}
            href={hrefFor({ q, cat, sub, rx: s.id })}
            className={`rounded-full border px-3 py-1.5 text-sm font-bold ${
              rx === s.id
                ? s.id === 'rx'
                  ? 'border-[#F5C2C7] bg-[#FFF0F0] text-danger'
                  : s.id === 'controlled'
                    ? 'border-[#FFD8A8] bg-[#FFF4E6] text-warning'
                    : 'border-brand bg-mint text-brand-dark'
                : 'border-border bg-white text-muted'
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-muted">
        {list.length} produit{list.length > 1 ? 's' : ''}
        {cat ? ` · ${cat}` : ''}
        {sub ? ` · ${sub}` : ''}
        {rx === 'otc' ? ' · sans ordonnance' : ''}
        {rx === 'rx' ? ' · sur ordonnance' : ''}
        {rx === 'controlled' ? ' · contrôle requis' : ''}
        {q ? ` · « ${q} »` : ''}
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.length ? (
          list.map((p) => <ProductCard key={p.id} product={p} />)
        ) : (
          <p className="text-muted">
            {q ? `Aucun produit ne correspond à « ${q} ».` : cat ? `Aucun produit dans « ${cat} ».` : 'Aucun produit.'}
          </p>
        )}
      </div>
    </main>
  );
}
