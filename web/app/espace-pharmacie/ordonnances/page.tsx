'use client';

import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';

const items = [
  {
    file: 'ordonnance-amoxicilline.jpg',
    products: 'Amoxicilline 500 mg',
    status: 'En vérification',
    tone: 'badge-orange',
  },
];

export default function PharmacyPrescriptionsPage() {
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Ordonnances</h1>
        <p className="mt-2 text-sm text-muted">Validez les fichiers avant d’ouvrir le paiement client.</p>
        <div className="mt-6 space-y-3">
          {items.map((rx) => (
            <div key={rx.file} className="card p-5">
              <div className="flex justify-between gap-3">
                <p className="font-extrabold text-ink">{rx.file}</p>
                <span className={rx.tone}>{rx.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{rx.products}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" className="btn-primary !h-10 text-sm">
                  Valider
                </button>
                <button type="button" className="btn-secondary !h-10 text-sm">
                  Refuser
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </RequireRole>
  );
}
