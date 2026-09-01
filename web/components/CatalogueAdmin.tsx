'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CatalogProductImage } from '@/components/CatalogProductImage';

type Country = { id: string; code: string; name: string };
type Category = { id: string; name: string; slug: string };
type Product = {
  id: string;
  name: string;
  genericName: string | null;
  brandName: string | null;
  dosage: string | null;
  pharmaceuticalForm: string | null;
  description: string | null;
  active: boolean;
  requiresPrescription: boolean;
  prescriptionRequired: boolean;
  category: { id: string; name: string };
  country: { code: string; name: string };
  countryCode: string;
  regulatory: { status: string; label: string };
  regulatoryLabel: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

const FALLBACK_COUNTRIES: Country[] = [
  { id: 'BJ', code: 'BJ', name: 'Bénin' },
  { id: 'CM', code: 'CM', name: 'Cameroun' },
  { id: 'GA', code: 'GA', name: 'Gabon' },
];

export function CatalogueAdmin({ countries: initialCountries = [] }: { countries?: Country[] }) {
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [country, setCountry] = useState(initialCountries.find((c) => c.code === 'GA')?.code || initialCountries[0]?.code || 'GA');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRx, setFilterRx] = useState<'all' | 'yes' | 'no'>('all');
  const [busy, setBusy] = useState('');
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [rx, setRx] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState('');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (countries.length) return;
    fetch('/api/v1/catalog/countries')
      .then((r) => r.json())
      .then((data: { countries?: Country[] }) => {
        const rows = data.countries?.length ? data.countries : FALLBACK_COUNTRIES;
        setCountries(rows);
        if (!country) setCountry(rows.find((c) => c.code === 'GA')?.code || rows[0].code);
      })
      .catch(() => setCountries(FALLBACK_COUNTRIES));
  }, [countries.length, country]);

  useEffect(() => {
    if (!country) return;
    fetch(`/api/v1/catalog/categories?country=${country}`)
      .then((r) => r.json())
      .then((data: { categories?: Category[] }) => {
        const rows = data.categories || [];
        setCategories(rows);
        setCategoryId((current) => (rows.some((c) => c.id === current) ? current : rows[0]?.id || ''));
        setFilterCategory('');
      })
      .catch(() => setCategories([]));
  }, [country]);

  const loadProducts = useCallback(async () => {
    if (!country) return;
    const params = new URLSearchParams({ country, includeInactive: '1', limit: '100' });
    if (search) params.set('search', search);
    if (filterCategory) params.set('category', filterCategory);
    if (filterRx === 'yes') params.set('prescriptionRequired', 'true');
    if (filterRx === 'no') params.set('prescriptionRequired', 'false');
    const res = await fetch(`/api/v1/catalog/products?${params}`);
    const data = (await res.json()) as { products?: Product[]; error?: string };
    if (!res.ok) {
      setBusy(data.error || 'Impossible de charger le catalogue.');
      setProducts([]);
      return;
    }
    setProducts(data.products || []);
  }, [country, search, filterCategory, filterRx]);

  useEffect(() => {
    loadProducts().catch(() => setBusy('Impossible de charger le catalogue.'));
  }, [loadProducts]);

  const selectedCountry = useMemo(() => countries.find((c) => c.code === country), [countries, country]);

  const request = async (url: string, method: string, body?: unknown, ok = 'Enregistré') => {
    setBusy('…');
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json()) as { error?: string; message?: string };
    setBusy(data.error || data.message || (res.ok ? ok : 'Erreur'));
    if (res.ok) {
      await loadProducts();
      return true;
    }
    return false;
  };

  const uploadImage = async (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      throw new Error('Format d’image non accepté. Utilisez JPEG, PNG ou WEBP.');
    }
    if (file.size > 5 * 1024 * 1024) throw new Error('L’image dépasse 5 Mo.');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/v1/admin/catalog/products/upload-image', { method: 'POST', body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) throw new Error(data.error || 'Upload impossible.');
    return data.url;
  };

  const create = async () => {
    setBusy('…');
    try {
      const imageUrl = createFile ? await uploadImage(createFile) : undefined;
      const ok = await request(
        '/api/v1/catalog/products',
        'POST',
        {
          country,
          name,
          categoryId,
          genericName: genericName || null,
          dosage: dosage || null,
          pharmaceuticalForm: form || null,
          prescriptionRequired: rx,
          imageUrl: imageUrl || null,
          imageAlt: name,
        },
        'Statut réglementaire : À vérifier',
      );
      if (ok) {
        setName('');
        setGenericName('');
        setDosage('');
        setForm('');
        setRx(false);
        setCreateFile(null);
        setCreatePreview('');
      }
    } catch (err) {
      setBusy(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy('…');
    try {
      let imageUrl: string | null | undefined = undefined;
      if (removeImage) imageUrl = null;
      else if (editFile) imageUrl = await uploadImage(editFile);
      const ok = await request(
        `/api/v1/catalog/products/${editing.id}`,
        'PUT',
        {
          country,
          name: editing.name,
          genericName: editing.genericName,
          dosage: editing.dosage,
          pharmaceuticalForm: editing.pharmaceuticalForm,
          categoryId: editing.category.id,
          prescriptionRequired: editing.requiresPrescription,
          ...(imageUrl !== undefined ? { imageUrl, imageAlt: editing.name } : {}),
        },
        'Produit mis à jour',
      );
      if (ok) {
        setEditing(null);
        setEditFile(null);
        setEditPreview('');
        setRemoveImage(false);
      }
    } catch (err) {
      setBusy(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-wrap gap-2">
        {(countries.length ? countries : FALLBACK_COUNTRIES).map((c) => (
          <button
            key={c.id || c.code}
            type="button"
            onClick={() => setCountry(c.code)}
            className={`rounded-full px-3 py-1.5 text-sm font-extrabold ${country === c.code ? 'bg-brand text-black' : 'border border-border bg-white text-muted'}`}
          >
            {c.code} · {c.name}
          </button>
        ))}
      </div>

      <section className="card p-5">
        <h2 className="font-extrabold text-ink">Nouveau produit{selectedCountry ? ` · ${selectedCountry.name}` : ''}</h2>
        <p className="mt-1 text-sm text-muted">
          La fiche est catalogue. Aucun statut réglementaire n’est validé à la création.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="h-12 rounded-2xl border border-border px-4 font-semibold" placeholder="Nom" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="h-12 rounded-2xl border border-border px-4 font-semibold" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input className="h-12 rounded-2xl border border-border px-4 font-semibold" placeholder="Nom générique" value={genericName} onChange={(e) => setGenericName(e.target.value)} />
          <input className="h-12 rounded-2xl border border-border px-4 font-semibold" placeholder="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          <input className="h-12 rounded-2xl border border-border px-4 font-semibold sm:col-span-2" placeholder="Forme" value={form} onChange={(e) => setForm(e.target.value)} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-extrabold text-ink">Image du produit</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {createPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={createPreview} alt={name || 'Aperçu'} className="h-20 w-20 rounded-2xl bg-[#F3F7F4] object-contain p-1" />
            ) : (
              <CatalogProductImage alt={name || 'Produit'} size="thumb" />
            )}
            <label className="btn-secondary !h-10 cursor-pointer text-sm">
              {createPreview ? 'Remplacer' : 'Choisir une image'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setCreateFile(file);
                  setCreatePreview(URL.createObjectURL(file));
                }}
              />
            </label>
            {createPreview ? (
              <button
                type="button"
                className="text-sm font-extrabold text-danger"
                onClick={() => {
                  setCreateFile(null);
                  setCreatePreview('');
                }}
              >
                Supprimer
              </button>
            ) : null}
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={rx} onChange={(e) => setRx(e.target.checked)} />
          Ordonnance possible
        </label>
        <button type="button" className="btn-primary mt-4" onClick={create}>
          Créer
        </button>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <input
          className="h-12 w-full rounded-2xl border border-border px-4 font-semibold sm:col-span-3"
          placeholder="Rechercher un produit"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="h-12 rounded-2xl border border-border px-4 font-semibold" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select className="h-12 rounded-2xl border border-border px-4 font-semibold" value={filterRx} onChange={(e) => setFilterRx(e.target.value as 'all' | 'yes' | 'no')}>
          <option value="all">Ordonnance : tous</option>
          <option value="yes">Ordonnance requise</option>
          <option value="no">Sans ordonnance</option>
        </select>
      </div>
      {busy ? <p className="text-sm font-bold text-brand-dark">{busy}</p> : null}

      <div className="space-y-3">
        {products.map((p) => {
          const isEditing = editing?.id === p.id;
          return (
            <div key={`${p.id}-${p.countryCode}`} className="card space-y-3 p-5">
              {isEditing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className="h-11 rounded-2xl border border-border px-3 font-semibold" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                  <select
                    className="h-11 rounded-2xl border border-border px-3 font-semibold"
                    value={editing.category.id}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setEditing({ ...editing, category: { id: e.target.value, name: cat?.name || editing.category.name } });
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input className="h-11 rounded-2xl border border-border px-3 font-semibold" placeholder="Nom générique" value={editing.genericName || ''} onChange={(e) => setEditing({ ...editing, genericName: e.target.value })} />
                  <input className="h-11 rounded-2xl border border-border px-3 font-semibold" placeholder="Dosage" value={editing.dosage || ''} onChange={(e) => setEditing({ ...editing, dosage: e.target.value })} />
                  <input className="h-11 rounded-2xl border border-border px-3 font-semibold sm:col-span-2" placeholder="Forme" value={editing.pharmaceuticalForm || ''} onChange={(e) => setEditing({ ...editing, pharmaceuticalForm: e.target.value })} />
                  <div className="sm:col-span-2">
                    <p className="text-sm font-extrabold">Image du produit</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      {removeImage ? (
                        <CatalogProductImage alt={editing.name} size="thumb" />
                      ) : editPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editPreview} alt={editing.name} className="h-20 w-20 rounded-2xl bg-[#F3F7F4] object-contain p-1" />
                      ) : (
                        <CatalogProductImage src={editing.imageUrl} alt={editing.imageAlt || editing.name} size="thumb" />
                      )}
                      <label className="btn-secondary !h-10 cursor-pointer text-sm">
                        Remplacer
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setEditFile(file);
                            setEditPreview(URL.createObjectURL(file));
                            setRemoveImage(false);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="text-sm font-extrabold text-danger"
                        onClick={() => {
                          setEditFile(null);
                          setEditPreview('');
                          setRemoveImage(true);
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={editing.requiresPrescription} onChange={(e) => setEditing({ ...editing, requiresPrescription: e.target.checked })} />
                    Ordonnance possible
                  </label>
                  <div className="flex gap-2">
                    <button type="button" className="btn-primary !h-10 text-sm" onClick={saveEdit}>
                      Enregistrer
                    </button>
                    <button type="button" className="btn-secondary !h-10 text-sm" onClick={() => setEditing(null)}>
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <CatalogProductImage src={p.imageUrl} alt={p.imageAlt || p.name} size="thumb" />
                    <div>
                    <p className="font-extrabold text-ink">{p.name}</p>
                    <p className="text-sm text-muted">
                      {p.genericName || '—'} · {p.category.name} · {p.dosage || '—'} · {p.pharmaceuticalForm || '—'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-muted">
                      Ordonnance : {p.prescriptionRequired || p.requiresPrescription ? 'Oui' : 'Non'} · Statut
                      réglementaire : {p.regulatoryLabel || p.regulatory?.label || 'À vérifier'} · Pays :{' '}
                      {p.country?.name || p.countryCode} · {p.active ? 'Actif' : 'Inactif'}
                    </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary !h-10 text-sm"
                      onClick={() => {
                        setEditing(p);
                        setEditFile(null);
                        setEditPreview('');
                        setRemoveImage(false);
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="btn-secondary !h-10 text-sm"
                      onClick={() => request(`/api/v1/catalog/products/${p.id}`, p.active ? 'DELETE' : 'PUT', p.active ? undefined : { country, active: true }, p.active ? 'Produit désactivé' : 'Produit réactivé')}
                    >
                      {p.active ? 'Désactiver' : 'Activer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!products.length ? <p className="text-sm font-bold text-muted">Aucun produit pour ce pays.</p> : null}
      </div>
    </div>
  );
}
