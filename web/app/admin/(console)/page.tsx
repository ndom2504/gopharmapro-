import Link from 'next/link';
import { adminStats } from '@/lib/adminData';
import { formatFcfa } from '@/lib/catalog';

export const metadata = { title: 'Administration' };
export const dynamic = 'force-dynamic';

export default function AdminHomePage() {
  const stats = adminStats();
  return (
    <div>
      <p className="text-sm font-extrabold text-brand">Tableau de bord</p>
      <h1 className="mt-1 text-3xl font-extrabold text-ink">Synthèse</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
        Les validations ici mettent à jour le site : Palmiers n’apparaît qu’une fois approuvée, l’Amoxicilline
        qu’une fois publiée. Mêmes dossiers démo que l’application.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value={String(stats.pendingPh)} label="Pharmacies en attente" hint={`${stats.pharmacies} au total`} />
        <Stat value={String(stats.pendingCo)} label="Livreurs en attente" hint={`${stats.couriers} au total`} />
        <Stat value={String(stats.review)} label="Produits en contrôle" hint={`${stats.catalog} au catalogue`} />
        <Stat value={formatFcfa(stats.pendingPay)} label="Virements à envoyer" hint={`${stats.orders} commande(s)`} />
      </div>
      <div className="card mt-8 p-5">
        <p className="font-extrabold text-ink">Dossiers à traiter</p>
        <p className="mt-1 text-sm text-muted">Commencez par les officines en attente de documents.</p>
        <Link href="/admin/pharmacies" className="btn-primary mt-5 inline-flex">
          Traiter les pharmacies
        </Link>
      </div>
    </div>
  );
}

function Stat({ value, label, hint }: { value: string; label: string; hint: string }) {
  return (
    <div className="card p-5">
      <p className="text-2xl font-extrabold text-ink">{value}</p>
      <p className="mt-1 font-extrabold text-ink">{label}</p>
      <p className="mt-1 text-xs font-bold text-muted">{hint}</p>
    </div>
  );
}
