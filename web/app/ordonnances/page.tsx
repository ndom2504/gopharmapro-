'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShop } from '@/components/ShopProvider';
import { getPublicPharmacies, pharmacyAccountIdFor } from '@/lib/catalog';
import { isClient } from '@/lib/accounts';
import {
  cartRxContext,
  readRxFile,
  rxStatusClass,
  rxStatusLabel,
  usePrescriptions,
} from '@/lib/prescriptions';

export default function OrdonnancesPage() {
  const { session, cart, ready } = useShop();
  const router = useRouter();
  const { items, add } = usePrescriptions();
  const ctx = useMemo(() => cartRxContext(cart), [cart]);
  const pharmacies = getPublicPharmacies();
  const [pharmacyId, setPharmacyId] = useState(ctx?.pharmacyId || pharmacies[0]?.id || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ fileUri: string; fileName: string; kind: 'image' | 'pdf' } | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const mine = session && isClient(session) ? items.filter((r) => r.clientId === session.id) : [];
  const pharmacy = ctx
    ? { id: ctx.pharmacyId, name: ctx.pharmacyName, accountId: ctx.pharmacyAccountId }
    : (() => {
        const p = pharmacies.find((x) => x.id === pharmacyId) || pharmacies[0];
        return p ? { id: p.id, name: p.name, accountId: pharmacyAccountIdFor(p) } : null;
      })();

  const onFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      setPreview(await readRxFile(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fichier illisible.');
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    if (!session || !isClient(session)) {
      router.push('/connexion?next=/ordonnances');
      return;
    }
    if (!preview || !pharmacy) {
      setError('Choisissez une photo nette ou un PDF.');
      return;
    }
    add({
      clientId: session.id,
      clientName: session.firstName + ' ' + session.lastName,
      pharmacyId: pharmacy.id,
      pharmacyAccountId: pharmacy.accountId,
      pharmacyName: pharmacy.name,
      fileName: preview.fileName,
      fileUri: preview.fileUri,
      kind: preview.kind,
      products: ctx?.products || [],
      productIds: ctx?.productIds || [],
    });
    setPreview(null);
    if (input.current) input.current.value = '';
  };

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mes ordonnances</h1>
      <p className="mt-2 text-sm text-muted">
        Photo ou PDF transmis à la pharmacie. Le paiement reste bloqué tant que le fichier n’est pas validé.
      </p>

      <div className="card mt-8 p-5">
        <p className="text-sm font-extrabold text-ink">Pharmacie</p>
        {ctx ? (
          <p className="mt-2 font-extrabold text-ink">{pharmacy?.name}</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {pharmacies.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPharmacyId(p.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                  pharmacyId === p.id ? 'border-brand bg-mint text-brand' : 'border-border text-muted'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-sm text-muted">
          {ctx?.products.length ? 'Produits : ' + ctx.products.join(', ') : 'Ajoutez un médicament sur ordonnance au panier pour lier les produits.'}
        </p>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="mt-4 block w-full text-sm"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {preview?.kind === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.fileUri} alt="Aperçu ordonnance" className="mt-4 max-h-64 w-full rounded-2xl object-contain bg-[#F3F7F4]" />
        ) : preview ? (
          <p className="mt-3 text-sm font-extrabold text-ink">{preview.fileName}</p>
        ) : null}
        {error ? <p className="mt-3 text-sm font-bold text-danger">{error}</p> : null}
        <button type="button" className="btn-primary mt-4" disabled={!preview || busy} onClick={send}>
          Transmettre à la pharmacie
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {mine.length === 0 ? (
          <div className="card p-5 text-sm text-muted">Aucun fichier transmis pour le moment.</div>
        ) : (
          mine.map((rx) => (
            <div key={rx.id} className="card p-5">
              <div className="flex justify-between gap-3">
                <p className="font-extrabold text-ink">{rx.fileName}</p>
                <span className={rxStatusClass[rx.status]}>{rxStatusLabel[rx.status]}</span>
              </div>
              <p className="mt-2 text-sm text-muted">🏥 {rx.pharmacyName}</p>
              <p className="text-sm text-muted">{new Date(rx.createdAt).toLocaleDateString('fr-GA')}</p>
              {rx.products.length ? <p className="text-sm text-muted">{rx.products.join(', ')}</p> : null}
              {rx.note ? <p className="mt-2 text-sm font-bold text-danger">{rx.note}</p> : null}
              {rx.kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rx.fileUri} alt="" className="mt-3 max-h-48 w-full rounded-2xl object-contain bg-[#F3F7F4]" />
              ) : (
                <a href={rx.fileUri} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-brand">
                  Ouvrir le PDF
                </a>
              )}
            </div>
          ))
        )}
      </div>
      <Link href="/produits" className="btn-secondary mt-8 inline-flex">
        Chercher un médicament
      </Link>
    </main>
  );
}
