'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, courierNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isCourier } from '@/lib/accounts';

const vehicleLabel: Record<string, string> = { moto: 'Moto', voiture: 'Voiture', other: 'Autre' };

export default function CourierProfilePage() {
  const { session, logout } = useShop();
  const router = useRouter();
  if (!isCourier(session)) {
    return (
      <RequireRole role="courier">
        <div />
      </RequireRole>
    );
  }
  const required = session.documents.filter((d) => d.required);
  const verifiedDocs = required.filter((d) => d.status === 'verified').length;
  return (
    <RequireRole role="courier">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={courierNav} />
        <h1 className="text-3xl font-extrabold text-ink">Profil livreur</h1>
        <div className="card mt-6 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-mint text-xl font-extrabold text-brand">
            {session.firstName[0]}
            {session.lastName[0]}
          </div>
          <p className="mt-4 text-xl font-extrabold text-ink">
            {session.firstName} {session.lastName}
          </p>
          <p className="mt-2 text-sm text-muted">{session.phone}</p>
          <p className="text-sm text-muted">{session.email}</p>
          <p className="mt-4 text-sm font-extrabold text-ink">Zone de livraison</p>
          <p className="text-sm text-muted">
            {session.area ? `${session.area}, ` : ''}
            {session.city} ({session.province})
          </p>
          <p className="mt-4 text-sm font-extrabold text-ink">Véhicule</p>
          <p className="text-sm text-muted">
            {vehicleLabel[session.vehicle] || session.vehicle}
            {session.plate ? ` · ${session.plate}` : ''}
          </p>
          <p className="mt-4 text-sm font-extrabold text-ink">Documents</p>
          <p className="text-sm text-muted">
            Statut de vérification : {verifiedDocs}/{required.length} validés
          </p>
          <p className="mt-4 text-sm font-extrabold text-ink">Coordonnées de paiement</p>
          <p className="text-sm text-muted">{session.payoutPhone || session.phone}</p>
        </div>
        <button
          type="button"
          className="btn-secondary mt-8 w-full"
          onClick={() => {
            logout();
            router.replace('/connexion?role=courier');
          }}
        >
          Déconnexion
        </button>
      </main>
    </RequireRole>
  );
}
