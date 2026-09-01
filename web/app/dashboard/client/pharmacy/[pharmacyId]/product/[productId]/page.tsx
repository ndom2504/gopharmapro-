'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useShop } from '@/components/ShopProvider';
import { isClient } from '@/lib/accounts';
import { addOrderDraftLine } from '@/lib/client/orderDraft';
import { readRxFile } from '@/lib/prescriptions';
import { CatalogProductImage } from '@/components/CatalogProductImage';

type OfferPayload = {
  product: {
    id: string;
    name: string;
    genericName: string | null;
    dosage: string | null;
    pharmaceuticalForm: string | null;
    description: string | null;
    imageUrl: string | null;
    imageAlt?: string | null;
    category: { name: string };
    requiresPrescription: boolean;
  };
  pharmacy: {
    id: string;
    name: string;
    city: string | null;
    address: string | null;
    phone: string | null;
  };
  offer: {
    price: number;
    currency: string;
    stockQuantity: number;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
  };
};

export default function ClientOfferPage() {
  const params = useParams<{ pharmacyId: string; productId: string }>();
  const router = useRouter();
  const { session } = useShop();
  const [data, setData] = useState<OfferPayload | null>(null);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup');
  const [message, setMessage] = useState('');
  const [rxFile, setRxFile] = useState<{ fileUri: string; fileName: string } | null>(null);
  const [rx, setRx] = useState<{ id: string; status: string; note?: string | null; canPay?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/client/offers/${params.pharmacyId}/${params.productId}`)
      .then((r) => r.json())
      .then((body: OfferPayload & { error?: string }) => {
        if (body.error || !body.product) setError(body.error || 'Offre introuvable.');
        else {
          setData(body);
          if (!body.offer.pickupAvailable && body.offer.deliveryAvailable) setFulfillment('delivery');
        }
      })
      .catch(() => setError('Offre introuvable.'));
  }, [params.pharmacyId, params.productId]);

  useEffect(() => {
    if (!isClient(session)) return;
    fetch('/api/v1/client/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: session.id,
        email: session.email,
        country: 'country' in session ? session.country : 'GA',
        city: session.city,
        address: session.address,
      }),
    }).catch(() => undefined);
  }, [session]);

  const ensureClient = () => {
    if (!isClient(session)) {
      router.push(`/connexion?role=client&next=/dashboard/client/pharmacy/${params.pharmacyId}/product/${params.productId}`);
      return false;
    }
    return true;
  };

  const addToOrder = () => {
    if (!data || !ensureClient()) return;
    if (data.product.requiresPrescription && rx?.status !== 'PRESCRIPTION_APPROVED') {
      setError('Le paiement n’est possible qu’après validation de l’ordonnance par la pharmacie.');
      return;
    }
    addOrderDraftLine({
      pharmacyId: data.pharmacy.id,
      pharmacyName: data.pharmacy.name,
      productId: data.product.id,
      productName: data.product.name,
      quantity: qty,
      unitPrice: data.offer.price,
      currency: data.offer.currency,
      fulfillment,
      deliveryAddress: fulfillment === 'delivery' && isClient(session) ? session.address || session.city : undefined,
    });
    setMessage('Ajouté à la commande. Le paiement sera proposé après cette étape.');
  };

  const sendRx = async () => {
    if (!data || !ensureClient() || !rxFile) return;
    setBusy(true);
    setError('');
    try {
      const created = await fetch('/api/v1/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacyId: data.pharmacy.id,
          productId: data.product.id,
          quantity: qty,
          documentUrl: rxFile.fileUri,
        }),
      });
      const body = (await created.json()) as { prescription?: { id: string; status: string }; error?: string };
      if (!created.ok || !body.prescription) {
        setError(body.error || 'Envoi impossible.');
        return;
      }
      setRx(body.prescription);
      setMessage('Demande envoyée. La pharmacie vérifiera l’ordonnance. GoPharmaPro ne valide pas automatiquement ce document.');
    } finally {
      setBusy(false);
    }
  };

  if (error && !data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/dashboard/client" className="text-sm font-extrabold text-brand">
          ← Recherche
        </Link>
        <p className="mt-6 text-sm font-bold text-danger">{error}</p>
      </main>
    );
  }
  if (!data) return <main className="mx-auto max-w-3xl px-4 py-10 text-sm font-bold text-muted">Chargement…</main>;

  const address = isClient(session) ? session.address || [session.area, session.city].filter(Boolean).join(', ') : '';

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard/client" className="text-sm font-extrabold text-brand">
        ← Recherche
      </Link>
      <div className="mt-5">
        <CatalogProductImage
          src={data.product.imageUrl}
          alt={data.product.imageAlt || data.product.name}
          size="hero"
          priority
        />
      </div>
      <h1 className="mt-5 text-3xl font-extrabold text-ink">{data.product.name}</h1>
      <p className="mt-2 text-sm text-muted">
        {data.product.genericName || '—'} · {data.product.dosage || '—'} · {data.product.pharmaceuticalForm || '—'} · {data.product.category.name}
      </p>
      {data.product.description ? <p className="mt-3 text-sm leading-6 text-muted">{data.product.description}</p> : null}
      {data.product.requiresPrescription ? (
        <p className="mt-4 text-sm font-extrabold text-warning">⚠ MÉDICAMENT SUR ORDONNANCE — le paiement n’est pas possible avant validation pharmacie.</p>
      ) : null}

      <section className="card mt-6 p-5">
        <h2 className="font-extrabold text-ink">{data.pharmacy.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {data.pharmacy.address || '—'}
          <br />
          {data.pharmacy.city || '—'}
          {data.pharmacy.phone ? ` · ${data.pharmacy.phone}` : ''}
        </p>
        <p className="mt-3 text-lg font-extrabold">
          {data.offer.price.toLocaleString('fr-FR')} {data.offer.currency}
        </p>
        <p className="text-sm font-bold text-muted">Stock disponible : {data.offer.stockQuantity}</p>
      </section>

      <section className="card mt-4 space-y-4 p-5">
        <p className="text-sm font-extrabold">Quantité</p>
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary !h-10 !w-10" onClick={() => setQty((n) => Math.max(1, n - 1))}>
            −
          </button>
          <span className="min-w-8 text-center font-extrabold">{qty}</span>
          <button type="button" className="btn-secondary !h-10 !w-10" onClick={() => setQty((n) => Math.min(data.offer.stockQuantity, n + 1))}>
            +
          </button>
        </div>
        <p className="text-sm font-extrabold">Options</p>
        {data.offer.pickupAvailable ? (
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="radio" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} />
            Retrait en pharmacie
          </label>
        ) : null}
        {data.offer.deliveryAvailable ? (
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="radio" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} />
            Livraison
          </label>
        ) : null}
        {fulfillment === 'delivery' ? (
          <p className="text-sm text-muted">Adresse de livraison : {address || 'Ajoutez une adresse dans votre profil.'}</p>
        ) : null}

        {data.product.requiresPrescription ? (
          <div className="space-y-3 rounded-2xl border border-border p-4">
            <p className="text-sm font-extrabold text-ink">1 à 4. Transmettre l’ordonnance — 5 à 7. La pharmacie décide, puis seulement le paiement.</p>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const read = await readRxFile(file);
                  setRxFile({ fileUri: read.fileUri, fileName: read.fileName });
                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Fichier illisible.');
                }
              }}
            />
            <button type="button" className="btn-secondary w-full" disabled={!rxFile || busy} onClick={sendRx}>
              Envoyer la demande
            </button>
            {rx ? <p className="text-sm font-bold text-muted">Statut : {rx.status.replaceAll('_', ' ')}{rx.note ? ` — ${rx.note}` : ''}</p> : null}
          </div>
        ) : null}

        {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}
        {message ? <p className="text-sm font-bold text-brand-dark">{message}</p> : null}
        <button type="button" className="btn-primary w-full" onClick={addToOrder} disabled={Boolean(data.product.requiresPrescription && rx?.status !== 'PRESCRIPTION_APPROVED')}>
          Ajouter à la commande
        </button>
      </section>
    </main>
  );
}
