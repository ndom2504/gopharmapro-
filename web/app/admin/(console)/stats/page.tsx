import { adminStats, getAdminState } from '@/lib/adminData';
import { formatFcfa } from '@/lib/catalog';

export const metadata = { title: 'Statistiques' };
export const dynamic = 'force-dynamic';

export default function AdminStatsPage() {
  const stats = adminStats();
  const { orders, payouts } = getAdminState();
  const gmv = orders.reduce((a, o) => a + o.total, 0);
  const paidOut = payouts.filter((p) => p.status === 'sent').reduce((a, p) => a + p.amount, 0);
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Statistiques</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat value={String(stats.pharmacies)} label="Pharmacies" hint={`${stats.pendingPh} en attente`} />
        <Stat value={String(stats.couriers)} label="Livreurs" hint={`${stats.pendingCo} en attente`} />
        <Stat value={String(stats.orders)} label="Commandes" hint={formatFcfa(gmv)} />
        <Stat value={String(stats.catalog)} label="Produits" hint={`${stats.review} en contrôle`} />
        <Stat value={formatFcfa(stats.pendingPay)} label="Paiements à envoyer" hint={`${formatFcfa(paidOut)} déjà versés`} />
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
