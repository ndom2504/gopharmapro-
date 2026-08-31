'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Country = { id: string; code: string; name: string };
type Category = { id: string; name: string; slug: string; active: boolean; countryCode: string; countryId: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  genericName: string | null;
  dosage: string | null;
  dosageUnit: string | null;
  pharmaceuticalForm: string | null;
  active: boolean;
  requiresPrescription: boolean;
  categoryName: string;
  categoryId: string;
  countryCode: string;
  statuses: { countryId: string; countryCode: string; status: string; verified: boolean; requiresPrescription: boolean | null }[];
};

export function CatalogueAdmin({
  countries,
  categories,
  products,
}: {
  countries: Country[];
  categories: Category[];
  products: Product[];
}) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [country, setCountry] = useState(countries[0]?.code || '');
  const [busy, setBusy] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [rx, setRx] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (country && p.countryCode !== country) return false;
      if (!term) return true;
      return `${p.name} ${p.genericName || ''} ${p.slug}`.toLowerCase().includes(term);
    });
  }, [products, q, country]);

  const post = async (url: string, body: unknown, ok = 'Enregistré') => {
    setBusy('…');
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = (await res.json()) as { error?: string };
    setBusy(data.error || (res.ok ? ok : 'Erreur'));
    if (res.ok) router.refresh();
  };

  const patch = async (url: string, body: unknown) => {
    setBusy('…');
    const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = (await res.json()) as { error?: string };
    setBusy(data.error || (res.ok ? 'Mis à jour' : 'Erreur'));
    if (res.ok) router.refresh();
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        {countries.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCountry(c.code)}
            className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${country === c.code ? 'bg-brand text-black' : 'border border-border bg-white text-muted'}`}
          >
            {c.code} · {c.name}
          </button>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="font-extrabold text-ink">Nouveau produit</h2>
        <p className="mt-1 text-sm text-muted">La fiche est catalogue. Aucun statut réglementaire n’est validé à la création.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="h-12 rounded-2xl border border-border px-4 font-semibold" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="h-12 rounded-2xl border border-border px-4 font-semibold" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories
              .filter((c) => !country || c.countryCode === country)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={rx} onChange={(e) => setRx(e.target.checked)} />
          Ordonnance possible (modifiable, non bloquant)
        </label>
        <button
          type="button"
          className="btn-primary mt-4"
          onClick={() => post('/api/v1/admin/catalog/products', { name, categoryId, requiresPrescription: rx })}
        >
          Créer
        </button>
      </section>

      <input
        className="h-12 w-full rounded-2xl border border-border px-4 font-semibold"
        placeholder="Rechercher un produit"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {busy ? <p className="text-sm font-bold text-brand-dark">{busy}</p> : null}

      <div className="space-y-3">
        {filtered.map((p) => {
          const st = p.statuses.find((s) => s.countryCode === p.countryCode);
          return (
            <div key={p.id} className="card space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-ink">{p.name}</p>
                  <p className="text-sm text-muted">
                    {p.categoryName} · {p.countryCode}
                    {p.genericName ? ` · ${p.genericName}` : ''}
                    {p.dosage ? ` · ${p.dosage} ${p.dosageUnit || ''}` : ''}
                  </p>
                  <p className="mt-1 text-xs font-bold text-muted">
                    Réglementation : {st?.status || 'UNKNOWN'} · {st?.verified ? 'Vérifié' : 'Non vérifié'} · Ordonnance fiche :{' '}
                    {p.requiresPrescription ? 'Oui' : 'Non'}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary !h-10 text-sm"
                  onClick={() => patch(`/api/v1/admin/catalog/products/${p.id}`, { active: !p.active })}
                >
                  {p.active ? 'Désactiver' : 'Activer'}
                </button>
              </div>
              {st ? (
                <div className="flex flex-wrap gap-2">
                  {(['PENDING', 'UNKNOWN', 'ACTIVE', 'RESTRICTED', 'INACTIVE'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-xs font-extrabold"
                      onClick={() =>
                        post('/api/v1/admin/catalog/product-country', {
                          productId: p.id,
                          countryId: st.countryId,
                          status,
                          verified: status === 'ACTIVE',
                          requiresPrescription: p.requiresPrescription,
                        })
                      }
                    >
                      {status}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
