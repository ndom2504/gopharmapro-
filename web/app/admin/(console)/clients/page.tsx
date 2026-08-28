import { accountSeed } from '@/lib/accounts';

export const metadata = { title: 'Clients' };
export const dynamic = 'force-dynamic';

export default function AdminClientsPage() {
  const clients = accountSeed.filter((a) => a.role === 'client');
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Clients</h1>
      <p className="mt-2 text-sm text-muted">Annuaire des comptes acheteurs.</p>
      <div className="mt-6 space-y-3">
        {clients.map((c) =>
          c.role === 'client' ? (
            <div key={c.id} className="card p-5">
              <p className="font-extrabold text-ink">
                {c.firstName} {c.lastName}
              </p>
              <p className="mt-1 text-sm text-muted">{c.phone}</p>
              <p className="text-sm text-muted">{c.email}</p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
}
