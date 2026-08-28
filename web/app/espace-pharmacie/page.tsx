'use client';

import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/RequireRole';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy, partnerCatalog, partnerOrders, partnerPayouts, payoutTotals } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import { productImageSrc } from '@/lib/photos';
import { ProductPhoto } from '@/components/ProductPhoto';

const pipeline = [
  'Inscription',
  'Documents envoyés',
  'Vérification',
  'Approuvé / Rejeté',
  'Pharmacie active',
  'Ajout des produits',
  'Ouverture aux commandes',
];

function pipelineIndex(status: 'pending' | 'verified' | 'rejected') {
  if (status === 'rejected') return 3;
  if (status === 'verified') return 6;
  return 2;
}

function PharmacyHome() {
  const { session, logout } = useShop();
  const router = useRouter();
  if (!isPharmacy(session)) return null;

  const verified = session.status === 'verified';
  const current = pipelineIndex(session.status);
  const catalog = partnerCatalog.filter((i) => i.pharmacyId === session.id);
  const jobs = partnerOrders.filter((o) => o.pharmacyAccountId === session.id);
  const money = payoutTotals(
    partnerPayouts.filter((p) => p.beneficiary === 'pharmacy'),
    session.id,
  );
  const pendingDocs = session.documents.filter((d) => d.fileName && d.status === 'pending').length;
  const manager =
    session.managerRole === 'titulaire' ? 'Pharmacien titulaire' : session.managerRole === 'gerant' ? 'Gérant' : 'Responsable';

  const leave = () => {
    logout();
    router.replace('/connexion?role=pharmacy');
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm font-extrabold text-brand">Espace pharmacie</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink">{session.pharmacyName}</h1>

      <div
        className={`card mt-6 flex items-start gap-3 p-5 ${
          verified ? 'border-[#BCE9D8] bg-[#E7F7F1]' : session.status === 'rejected' ? 'border-[#F5C2C7] bg-[#FFF0F0]' : 'border-[#FFD8A8] bg-[#FFF4E6]'
        }`}
      >
        <div className="flex-1">
          <p className="font-extrabold text-ink">
            {verified ? 'Pharmacie vérifiée' : session.status === 'rejected' ? 'Dossier rejeté' : 'Vérification en cours'}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {verified
              ? 'Compte accepté. Vous pouvez ajouter des produits et recevoir des commandes.'
              : session.status === 'rejected'
                ? 'La structure n’est pas autorisée à vendre sur Go Pharma Pro.'
                : 'L’officine n’est pas visible sur la marketplace tant que le dossier n’est pas validé.'}
          </p>
        </div>
        <span className={verified ? 'badge-green' : session.status === 'rejected' ? 'badge-red' : 'badge-orange'}>
          {verified ? 'Vérifié' : session.status === 'rejected' ? 'Rejeté' : 'En attente'}
        </span>
      </div>

      {verified ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="card p-5">
            <p className="text-sm font-extrabold text-ink">Paiements</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {formatFcfa(money.pending)} en attente de virement · {formatFcfa(money.sent)} déjà versés.
            </p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-extrabold text-ink">Commandes</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {jobs.length ? `${jobs.length} commande(s) en cours (retrait ou livraison).` : 'Les clients peuvent retirer en pharmacie ou demander un livreur.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="card mt-4 border-[#FFD8A8] bg-[#FFF4E6] p-5">
          <p className="text-sm font-extrabold text-ink">Ajout de produits</p>
          <p className="mt-2 text-sm leading-6 text-muted">Disponible uniquement après acceptation du dossier (badge Vérifié).</p>
        </div>
      )}

      {verified ? (
        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-ink">Catalogue</h2>
          <p className="mt-1 text-sm text-muted">{catalog.length} produit(s) dans votre officine.</p>
          <div className="mt-4 space-y-3">
            {catalog.map((item) => (
              <div key={item.id} className="card flex items-center gap-4 p-4">
                <ProductPhoto src={productImageSrc(item.imageKey)} alt={item.name} size="thumb" />
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-ink">{item.name}</p>
                  <p className="text-sm text-muted">
                    {item.category} · {formatFcfa(item.price)} · stock {item.stock}
                  </p>
                </div>
                <span className={item.status === 'published' ? 'badge-green' : 'badge-orange'}>
                  {item.status === 'published' ? 'Publié' : 'En revue'}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {verified && jobs.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-ink">Commandes en cours</h2>
          <div className="mt-4 space-y-3">
            {jobs.map((o) => (
              <div key={o.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-extrabold text-ink">#{o.id}</p>
                  <span className="badge-green">{o.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatFcfa(o.total)} · {o.deliveryAddress}
                </p>
                <p className="mt-2 font-extrabold tracking-widest text-brand">Code ramassage {o.pickupCode}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card mt-6 p-5">
        <p className="text-sm font-extrabold text-ink">Parcours d’activation</p>
        <ol className="mt-4 space-y-3">
          {pipeline.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  i <= current ? 'bg-brand' : 'bg-border'
                } ${i === current && session.status === 'pending' ? 'ring-2 ring-[#FFD8A8]' : ''}`}
              />
              <span className={`text-sm font-bold ${i > current ? 'text-muted' : 'text-ink'}`}>{label}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-4 p-5">
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
          <p className="text-sm font-extrabold text-ink">Documents (privés)</p>
          <p className="mt-1 text-sm text-muted">{pendingDocs} document(s) en attente de vérification.</p>
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

      <button type="button" className="btn-secondary mt-8 w-full" onClick={leave}>
        Se déconnecter
      </button>
    </main>
  );
}

export default function PharmacySpacePage() {
  return (
    <RequireRole role="pharmacy">
      <PharmacyHome />
    </RequireRole>
  );
}
