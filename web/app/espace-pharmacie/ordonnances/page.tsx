'use client';

import { useState } from 'react';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';
import { rxStatusClass, rxStatusLabel, usePrescriptions } from '@/lib/prescriptions';

function List() {
  const { session } = useShop();
  const { items, setStatus } = usePrescriptions();
  const [notes, setNotes] = useState<Record<string, string>>({});
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
