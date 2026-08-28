'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { useShop } from '@/components/ShopProvider';
import { isCourier, partnerOrders, partnerPayouts, payoutTotals } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';

const vehicleLabel: Record<string, string> = { moto: 'Moto', voiture: 'Voiture', other: 'Autre' };

function CourierHome() {
  const { session, logout } = useShop();
  const router = useRouter();
  if (!isCourier(session)) return null;

  const money = payoutTotals(
    partnerPayouts.filter((p) => p.beneficiary === 'courier'),
    session.id,
  );
  const runs = partnerOrders.filter((o) => o.courierId === session.id);
  const required = session.documents.filter((d) => d.required);
  const verifiedDocs = required.filter((d) => d.status === 'verified').length;

  const leave = () => {
    logout();
    router.replace('/connexion?role=courier');
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-extrabold text-muted">Espace livreur</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">
        {session.firstName} {session.lastName}
      </h1>
      <span
        className={`mt-4 inline-flex ${
          session.status === 'active' ? 'badge-green' : session.status === 'suspended' ? 'badge-red' : 'badge-orange'
        }`}
      >
        {session.status === 'active' ? 'Compte actif' : session.status === 'suspended' ? 'Compte suspendu' : 'Vérification en cours'}
      </span>

      <section className="card mt-6 p-5">
        <p className="text-sm font-extrabold text-ink">Gains</p>
        <p className="mt-2 text-2xl font-extrabold text-ink">{formatFcfa(money.pending)}</p>
        <p className="mt-1 text-sm text-muted">En attente de virement · {formatFcfa(money.sent)} déjà versés</p>
      </section>

      <section className="card mt-4 p-5">
        <p className="text-sm font-extrabold text-ink">Profil</p>
        <p className="mt-2 font-bold text-ink">{session.phone || 'Téléphone à compléter'}</p>
        <p className="text-sm text-muted">{session.email}</p>
        <p className="mt-2 text-sm text-muted">
          Véhicule : {vehicleLabel[session.vehicle] || session.vehicle}
          {session.plate ? ` · ${session.plate}` : ''}
        </p>
        {session.city ? (
          <p className="text-sm text-muted">
            Zone : {session.area ? `${session.area}, ` : ''}
            {session.city} ({session.province})
          </p>
        ) : null}
        {session.payoutPhone ? <p className="text-sm text-muted">Gains : {session.payoutPhone}</p> : null}
        {session.documents.length ? (
          <p className="mt-3 text-sm text-muted">
            {verifiedDocs}/{required.length} documents vérifiés
          </p>
        ) : null}
      </section>

      {runs.length ? (
        <section className="mt-4 space-y-3">
          {runs.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-extrabold text-ink">#{o.id}</p>
                <span className="badge-green">{o.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted">
                {o.pharmacyName} → {o.deliveryAddress}
              </p>
              {o.status !== 'Livrée' ? (
                <p className="mt-2 font-extrabold tracking-widest text-brand">Code ramassage {o.pickupCode}</p>
              ) : null}
            </div>
          ))}
        </section>
      ) : (
        <section className="card mt-4 border-[#FFD8A8] bg-[#FFF4E6] p-5">
          <p className="text-sm font-extrabold text-ink">Courses</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Aucune course. Dès qu’un client paie une livraison, le code de ramassage apparaît ici.
          </p>
        </section>
      )}

      <button type="button" className="btn-secondary mt-8 w-full" onClick={leave}>
        Se déconnecter
      </button>
    </main>
  );
}

export default function CourierSpacePage() {
  return (
    <RequireRole role="courier">
      <CourierHome />
    </RequireRole>
  );
}
