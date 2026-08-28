import Link from 'next/link';
import { PhonePreview } from '@/components/PhonePreview';
import { PharmacyCard } from '@/components/PharmacyCard';
import { ProductCard } from '@/components/ProductCard';
import { SearchForm } from '@/components/SearchForm';
import { categories, paymentMethods, pharmacies, products } from '@/lib/catalog';
import { site } from '@/lib/site';

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="inline-flex rounded-full bg-mint px-3 py-1 text-sm font-bold text-brand-dark">
            Livraison au Gabon
          </p>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Médicaments et parapharmacie,{' '}
            <span className="text-brand">livrés près de chez vous.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted">
            Comparez les pharmacies, commandez vos produits et payez en MobiCash, Airtel Money ou
            Moov Money — comme sur l’application {site.name}.
          </p>
          <div className="mt-8">
            <SearchForm />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pharmacies" className="btn-secondary">
              Voir les pharmacies
            </Link>
            <Link href="/rejoindre" className="btn-secondary">
              Je suis une pharmacie
            </Link>
          </div>
        </div>
        <PhonePreview />
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-[19px] font-extrabold text-ink">Catégories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/produits?q=${encodeURIComponent(c.name)}`}
              className="card flex min-h-[100px] flex-col items-start justify-center gap-2 p-4"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="font-extrabold text-ink">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="text-[19px] font-extrabold text-ink">Pharmacies près de vous</h2>
          <Link href="/pharmacies" className="text-sm font-extrabold text-brand">
            Voir tout
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pharmacies.slice(0, 2).map((p) => (
            <PharmacyCard key={p.id} pharmacy={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <h2 className="text-[19px] font-extrabold text-ink">Produits disponibles</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 mb-20 max-w-6xl px-4 sm:px-6">
        <h2 className="text-[19px] font-extrabold text-ink">Paiement mobile</h2>
        <p className="mt-2 text-sm text-muted">MobiCash, Airtel Money et Moov Money sont disponibles au Gabon.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {paymentMethods.map((m) => (
            <div key={m.id} className="card flex items-center gap-3 p-5" style={{ background: m.background }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
              <div className="flex-1">
                <p className="font-extrabold text-ink">{m.name}</p>
                <p className="text-sm text-muted">{m.operator}</p>
              </div>
              <span className="font-bold text-muted">{m.ussd}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
