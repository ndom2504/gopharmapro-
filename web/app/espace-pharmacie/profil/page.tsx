'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy } from '@/lib/accounts';
import { IdentityVerify } from '@/components/IdentityVerify';

export default function PharmacyProfilePage() {
  const { session, logout } = useShop();
  const router = useRouter();
  if (!isPharmacy(session)) {
    return (
      <RequireRole role="pharmacy">
        <div />
      </RequireRole>
    );
  }
  const manager =
    session.managerRole === 'titulaire' ? 'Pharmacien titulaire' : session.managerRole === 'gerant' ? 'Gérant' : 'Responsable';
  const pendingDocs = session.documents.filter((d) => d.fileName && d.status === 'pending').length;
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Profil</h1>
        <section className="card mt-6 p-5">
          <p className="text-sm font-extrabold text-ink">Responsable</p>
          <p className="mt-1 font-bold text-ink">{session.pharmacistName}</p>
          <p className="text-sm text-muted">
            {manager}
            {session.professionalNumber ? ` · ${session.professionalNumber}` : ''}
          </p>
          <p className="mt-4 text-sm font-extrabold text-ink">Adresse</p>
          <p className="mt-1 font-semibold leading-6 text-ink">
            {session.address}
            <br />
            {session.area}, {session.commune}, {session.city} ({session.province})
          </p>
          <p className="mt-4 text-sm font-extrabold text-ink">Contact</p>
          <p className="mt-1 font-semibold leading-6 text-ink">
            {session.phone}
            <br />
            {session.email}
          </p>
        </section>
        {session.documents.length ? (
          <section className="card mt-4 p-5">
            <p className="text-sm font-extrabold text-ink">Documents</p>
            <p className="mt-1 text-sm text-muted">{pendingDocs} document(s) en attente.</p>
            <ul className="mt-3 space-y-2">
              {session.documents
                .filter((d) => d.fileName)
                .map((d) => (
                  <li key={d.key} className="text-sm font-semibold text-ink">
                    {d.status === 'verified' ? '🟢' : d.status === 'rejected' ? '🔴' : '🟠'} {d.label}
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
        <IdentityVerify />
        <button
          type="button"
          className="btn-secondary mt-8 w-full"
          onClick={() => {
            logout();
            router.replace('/connexion?role=pharmacy');
          }}
        >
          Déconnexion
        </button>
      </main>
    </RequireRole>
  );
}
