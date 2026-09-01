import Link from 'next/link';
import { getAdminState } from '@/lib/adminData';
import { catalogDbAvailable } from '@/lib/prisma';
import { listPharmacies, serializePharmacy } from '@/lib/catalog/pharmacyQueries';

export const metadata = { title: 'Pharmacies' };
export const dynamic = 'force-dynamic';

export default async function AdminPharmaciesPage() {
  const { pharmacies } = getAdminState();
  const neon = catalogDbAvailable()
    ? (await listPharmacies({ includeInactive: true })).map((row) => serializePharmacy(row, { includeContact: true }))
    : [];
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Pharmacies</h1>
      <p className="mt-2 text-sm text-muted">Vérifiez les documents, puis acceptez ou rejetez le dossier.</p>
      {neon.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-extrabold text-ink">Catalogues Neon</h2>
          <p className="mt-1 text-sm text-muted">Offres commerciales (prix, stock, disponibilité) liées au catalogue central.</p>
          <div className="mt-4 space-y-3">
            {neon.map((p) => (
              <Link key={p.id} href={`/admin/pharmacies/offres/${p.id}`} className="card flex items-start justify-between gap-4 p-5">
                <div>
                  <p className="font-extrabold text-ink">{p.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {p.city || '—'} · {p.country.name}
                    {p.email ? ` · ${p.email}` : ''}
                  </p>
                </div>
                <span className={p.active ? 'badge-green' : 'badge-orange'}>{p.active ? 'Active' : 'Inactive'}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-6 space-y-3">
        {pharmacies.map((p) => (
          <Link key={p.id} href={`/admin/pharmacies/${p.id}`} className="card flex items-start justify-between gap-4 p-5">
            <div>
              <p className="font-extrabold text-ink">{p.pharmacyName}</p>
              <p className="mt-1 text-sm text-muted">
                {p.area}, {p.city} · {p.email}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Status status={p.status} />
              <span className={p.identityStatus === 'verified' ? 'badge-green' : 'badge-orange'}>
                {p.identityStatus === 'verified' ? 'Identité Stripe' : 'Identité à confirmer'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Status({ status }: { status: string }) {
  const label = status === 'verified' ? 'Vérifiée' : status === 'rejected' ? 'Rejetée' : 'En attente';
  const cls =
    status === 'verified' ? 'badge-green' : status === 'rejected' ? 'badge-red' : 'badge-orange';
  return <span className={cls}>{label}</span>;
}
