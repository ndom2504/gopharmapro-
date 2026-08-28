import { notFound } from 'next/navigation';
import { approvePharmacy, rejectPharmacy, setPharmacyDoc } from '@/app/admin/actions';
import { getPharmacy } from '@/lib/adminData';

export const dynamic = 'force-dynamic';

export default async function AdminPharmacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pharmacy = getPharmacy(id);
  if (!pharmacy) notFound();

  return (
    <div>
      <p className="text-sm font-extrabold text-brand">Dossier pharmacie</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">{pharmacy.pharmacyName}</h1>
      <div className="mt-3">
        <span
          className={
            pharmacy.status === 'verified'
              ? 'badge-green'
              : pharmacy.status === 'rejected'
                ? 'badge-red'
                : 'badge-orange'
          }
        >
          {pharmacy.status === 'verified' ? 'Vérifiée' : pharmacy.status === 'rejected' ? 'Rejetée' : 'En attente'}
        </span>
        <span className={pharmacy.identityStatus === 'verified' ? 'badge-green ml-2' : 'badge-orange ml-2'}>
          {pharmacy.identityStatus === 'verified' ? 'Identité Stripe' : 'Identité à confirmer'}
        </span>
      </div>
      <div className="card mt-6 p-5">
        <p className="text-sm font-extrabold text-ink">Responsable</p>
        <p className="mt-1 font-bold text-ink">{pharmacy.pharmacistName}</p>
        <p className="text-sm text-muted">{pharmacy.professionalNumber}</p>
        <p className="mt-4 text-sm font-extrabold text-ink">Contact</p>
        <p className="mt-1 font-bold text-ink">
          {pharmacy.phone}
          <br />
          {pharmacy.email}
        </p>
        <p className="mt-4 text-sm font-extrabold text-ink">Adresse</p>
        <p className="mt-1 font-bold text-ink">
          {pharmacy.address}
          <br />
          {pharmacy.area}, {pharmacy.commune}, {pharmacy.city}
        </p>
      </div>
      <div className="card mt-4 p-5">
        <p className="text-sm font-extrabold text-ink">Documents</p>
        <ul className="mt-3 divide-y divide-border">
          {pharmacy.documents.map((d) => (
            <li key={d.key} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{d.label}</p>
                <p className="text-sm text-muted">{d.fileName || 'Fichier manquant'}</p>
              </div>
              <form action={setPharmacyDoc.bind(null, pharmacy.id, d.key, 'verified')}>
                <button type="submit" className="text-sm font-extrabold text-brand">
                  OK
                </button>
              </form>
              <form action={setPharmacyDoc.bind(null, pharmacy.id, d.key, 'rejected')}>
                <button type="submit" className="text-sm font-extrabold text-danger">
                  Non
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <form action={approvePharmacy.bind(null, pharmacy.id)}>
          <button type="submit" className="btn-primary">
            Approuver la pharmacie
          </button>
        </form>
        <form action={rejectPharmacy.bind(null, pharmacy.id)}>
          <button type="submit" className="btn-secondary text-danger">
            Rejeter le dossier
          </button>
        </form>
      </div>
    </div>
  );
}
