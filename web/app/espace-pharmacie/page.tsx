'use client';

import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy, partnerCatalog, partnerOrders, partnerPayouts, payoutTotals } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import Link from 'next/link';
import { IdentityVerify } from '@/components/IdentityVerify';

const pipeline = [
  'Inscription',
  'Documents envoyés',
  'Identité Stripe',
  'Vérification',
  'Approuvé / Rejeté',
  'Pharmacie active',
  'Ajout des produits',
  'Ouverture aux commandes',
];

function pipelineIndex(
  status: 'pending' | 'verified' | 'rejected',
  identityStatus: 'unverified' | 'pending' | 'verified' | 'canceled',
) {
  if (status === 'rejected') return 4;
  if (status === 'verified') return 7;
  if (identityStatus !== 'verified') return 2;
  return 3;
}

function PharmacyHome() {
  const { session } = useShop();
  if (!isPharmacy(session)) return null;

  const verified = session.status === 'verified';
  const current = pipelineIndex(session.status, session.identityStatus || 'unverified');
  const catalog = partnerCatalog.filter((i) => i.pharmacyId === session.id);
  const jobs = partnerOrders.filter((o) => o.pharmacyAccountId === session.id);
  const money = payoutTotals(
    partnerPayouts.filter((p) => p.beneficiary === 'pharmacy'),
    session.id,
  );
  const pendingRx = jobs.filter((o) => o.items.some((i) => /amoxi/i.test(i.name))).length;

  return (
    <>
      <p className="text-sm font-extrabold text-brand">Espace pharmacie</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink">{session.pharmacyName}</h1>
      <div
        className={`card mt-6 flex items-start gap-3 p-5 ${
          verified
            ? 'border-[#BCE9D8] bg-[#E7F7F1]'
            : session.status === 'rejected'
              ? 'border-[#F5C2C7] bg-[#FFF0F0]'
              : 'border-[#FFD8A8] bg-[#FFF4E6]'
        }`}
      >
        <div className="flex-1">
          <p className="font-extrabold text-ink">
            {verified ? 'Pharmacie vérifiée' : session.status === 'rejected' ? 'Dossier rejeté' : 'Vérification en cours'}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {verified
              ? 'Compte accepté. Commandes, produits, ordonnances et ventes sont dans les onglets ci-dessus.'
              : session.status === 'rejected'
                ? 'La structure n’est pas autorisée à vendre sur Go Pharma Pro.'
                : 'L’officine n’est pas visible tant que le dossier n’est pas validé.'}
          </p>
        </div>
        <span className={verified ? 'badge-green' : session.status === 'rejected' ? 'badge-red' : 'badge-orange'}>
          {verified ? 'Vérifié' : session.status === 'rejected' ? 'Rejeté' : 'En attente'}
        </span>
      </div>
      <IdentityVerify />

      {verified ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link href="/espace-pharmacie/commandes" className="card p-5">
            <p className="text-2xl font-extrabold text-ink">{jobs.length}</p>
            <p className="mt-1 text-sm font-extrabold text-ink">Commandes</p>
          </Link>
          <Link href="/espace-pharmacie/produits" className="card p-5">
            <p className="text-2xl font-extrabold text-ink">{catalog.length}</p>
            <p className="mt-1 text-sm font-extrabold text-ink">Produits</p>
          </Link>
          <Link href="/espace-pharmacie/ventes" className="card p-5">
            <p className="text-lg font-extrabold text-ink">{formatFcfa(money.pending + money.sent)}</p>
            <p className="mt-1 text-sm font-extrabold text-ink">Ventes</p>
            <p className="text-xs text-muted">{pendingRx} ordonnance(s) à traiter</p>
          </Link>
        </div>
      ) : (
        <div className="card mt-4 border-[#FFD8A8] bg-[#FFF4E6] p-5">
          <p className="text-sm font-extrabold text-ink">Ajout de produits</p>
          <p className="mt-2 text-sm leading-6 text-muted">Disponible uniquement après acceptation du dossier.</p>
        </div>
      )}

      <section className="card mt-6 p-5">
        <p className="text-sm font-extrabold text-ink">Parcours d’activation</p>
        <ol className="mt-4 space-y-3">
          {pipeline.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${i <= current ? 'bg-brand' : 'bg-border'} ${
                  i === current && session.status === 'pending' ? 'ring-2 ring-[#FFD8A8]' : ''
                }`}
              />
              <span className={`text-sm font-bold ${i > current ? 'text-muted' : 'text-ink'}`}>{label}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export default function PharmacySpacePage() {
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <RoleSubnav items={pharmacyNav} />
        <PharmacyHome />
      </main>
    </RequireRole>
  );
}
