'use client';

import Link from 'next/link';

const items = [
  { id: 'rx-1', file: 'ordonnance-amoxicilline.jpg', pharmacy: 'Pharmacie du Centre', status: 'En vérification', products: 'Amoxicilline 500 mg', tone: 'badge-orange', date: '28 août 2026' },
  { id: 'rx-2', file: 'ordonnance-vitamine.jpg', pharmacy: 'Pharmacie du Centre', status: 'Validée', products: 'Vitamine C 1000 mg', tone: 'badge-green', date: '27 août 2026' },
];

export default function OrdonnancesPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink">Mes ordonnances</h1>
      <p className="mt-2 text-sm text-muted">
        Envoyée · En vérification · Validée · Refusée. Le paiement reste bloqué tant que le fichier n’est pas validé.
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold">
        <span className="badge-orange">En attente</span>
        <span className="badge-orange">En vérification</span>
        <span className="badge-green">Validée</span>
        <span className="badge-red">Refusée</span>
      </div>
      <div className="mt-8 space-y-3">
        {items.map((rx) => (
          <div key={rx.id} className="card p-5">
            <div className="flex justify-between gap-3">
              <p className="font-extrabold text-ink">{rx.file}</p>
              <span className={rx.tone}>{rx.status}</span>
            </div>
            <p className="mt-2 text-sm text-muted">🏥 {rx.pharmacy}</p>
            <p className="text-sm text-muted">{rx.date}</p>
            <p className="text-sm text-muted">{rx.products}</p>
          </div>
        ))}
      </div>
      <Link href="/produits" className="btn-secondary mt-8 inline-flex">
        Chercher un médicament
      </Link>
    </main>
  );
}
