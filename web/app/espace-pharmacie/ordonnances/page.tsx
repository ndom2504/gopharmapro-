'use client';

import { useEffect, useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';
import { rxStatusClass, rxStatusLabel, usePrescriptions } from '@/lib/prescriptions';

type NeonRx = { id: string; productName: string; status: string; note?: string | null; documentUrl?: string | null; quantity: number };

function NeonList({ pharmacyId }: { pharmacyId: string }) {
  const [rows, setRows] = useState<NeonRx[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const load = () => {
    fetch(`/api/v1/prescriptions?pharmacyId=${pharmacyId}`)
      .then((r) => r.json())
      .then((data: { prescriptions?: NeonRx[]; error?: string }) => {
        if (data.error) setError(data.error);
        else setRows(data.prescriptions || []);
      })
      .catch(() => setError('Demandes Neon indisponibles.'));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pharmacyId]);

  const review = async (id: string, action: 'approve' | 'reject') => {
    const res = await fetch(`/api/v1/prescriptions/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pharmacyId, note: notes[id] }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) setError(data.error || 'Action impossible.');
    else load();
  };

  if (!rows.length && !error) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xl font-extrabold text-ink">Demandes catalogue</h2>
      {error ? <p className="mt-2 text-sm font-bold text-danger">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {rows.map((rx) => (
          <div key={rx.id} className="card p-4">
            <p className="font-extrabold text-ink">{rx.productName}</p>
            <p className="text-sm text-muted">{rx.status.replaceAll('_', ' ')} · qté {rx.quantity}</p>
            {rx.documentUrl ? (
              <a href={rx.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-extrabold text-brand">
                Voir le document
              </a>
            ) : null}
            {rx.note ? <p className="mt-2 text-sm font-bold text-danger">{rx.note}</p> : null}
            {rx.status === 'PRESCRIPTION_SUBMITTED' || rx.status === 'PENDING_PRESCRIPTION' ? (
              <>
                <textarea className="mt-3 h-20 w-full rounded-2xl border border-border p-3 text-sm" placeholder="Motif en cas de refus" value={notes[rx.id] || ''} onChange={(e) => setNotes((n) => ({ ...n, [rx.id]: e.target.value }))} />
                <div className="mt-3 flex gap-2">
                  <button type="button" className="btn-primary !h-10 text-sm" onClick={() => review(rx.id, 'approve')}>
                    Valider
                  </button>
                  <button type="button" className="btn-secondary !h-10 text-sm" onClick={() => review(rx.id, 'reject')}>
                    Refuser
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function List() {
  const { session } = useShop();
  const { items, setStatus } = usePrescriptions();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pharmacyId, setPharmacyId] = useState('');
  useEffect(() => {
    if (!isPharmacy(session)) return;
    fetch('/api/v1/pharmacies/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: session.id, email: session.email }),
    })
      .then((r) => r.json())
      .then((data: { pharmacy?: { id: string } }) => {
        if (data.pharmacy?.id) setPharmacyId(data.pharmacy.id);
      })
      .catch(() => undefined);
  }, [session]);
  if (!isPharmacy(session)) return null;
  const mine = items.filter((r) => r.pharmacyAccountId === session.id);
  const pending = mine.filter((r) => r.status === 'sent' || r.status === 'review');

  return (
    <>
      <h1 className="text-3xl font-extrabold text-ink">Ordonnances</h1>
      <p className="mt-2 text-sm text-muted">
        {pending.length
          ? pending.length + ' fichier(s) à valider avant d’ouvrir le paiement client.'
          : 'Aucun fichier en attente.'}
      </p>
      <div className="mt-6 space-y-3">
        {mine.length === 0 ? (
          <div className="card p-5 text-sm text-muted">Les clients transmettent photo ou PDF depuis le panier.</div>
        ) : (
          mine.map((rx) => {
            const open = rx.status === 'sent' || rx.status === 'review';
            return (
              <div key={rx.id} className="card min-w-0 p-4 sm:p-5">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <p className="min-w-0 break-words font-extrabold text-ink">{rx.fileName}</p>
                  <span className={`shrink-0 ${rxStatusClass[rx.status]}`}>{rxStatusLabel[rx.status]}</span>
                </div>
                <p className="mt-2 text-sm text-muted">👤 {rx.clientName}</p>
                {rx.products.length ? <p className="text-sm text-muted">{rx.products.join(', ')}</p> : null}
                <p className="text-sm text-muted">{new Date(rx.createdAt).toLocaleDateString('fr-GA')}</p>
                {rx.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rx.fileUri} alt="" className="mt-3 max-h-72 w-full rounded-2xl object-contain bg-[#F3F7F4]" />
                ) : (
                  <a href={rx.fileUri} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-extrabold text-brand">
                    Ouvrir le PDF
                  </a>
                )}
                {rx.note ? <p className="mt-2 text-sm font-bold text-danger">{rx.note}</p> : null}
                {open ? (
                  <>
                    <textarea
                      value={notes[rx.id] || ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [rx.id]: e.target.value }))}
                      placeholder="Motif en cas de refus"
                      className="mt-4 h-20 w-full rounded-2xl border border-border p-3 text-sm font-semibold outline-none focus:border-brand"
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="btn-primary !h-10 text-sm" onClick={() => setStatus(rx.id, 'approved')}>
                        Valider
                      </button>
                      <button
                        type="button"
                        className="btn-secondary !h-10 text-sm"
                        onClick={() => {
                          const note = (notes[rx.id] || '').trim();
                          if (!note) return;
                          setStatus(rx.id, 'rejected', note);
                        }}
                      >
                        Refuser
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      {pharmacyId ? <NeonList pharmacyId={pharmacyId} /> : null}
    </>
  );
}

export default function PharmacyPrescriptionsPage() {
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <List />
      </main>
    </RequireRole>
  );
}
