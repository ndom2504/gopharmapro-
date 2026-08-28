import { setCourier, setCourierDoc } from '@/app/admin/actions';
import { getAdminState } from '@/lib/adminData';

export const metadata = { title: 'Livreurs' };
export const dynamic = 'force-dynamic';

export default function AdminCouriersPage() {
  const { couriers } = getAdminState();
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Livreurs</h1>
      <p className="mt-2 text-sm text-muted">Activez un livreur après contrôle CNI, permis et carte grise.</p>
      <div className="mt-6 space-y-4">
        {couriers.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-ink">
                  {c.firstName} {c.lastName}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {c.vehicle} {c.plate ? `· ${c.plate}` : ''} · {c.phone}
                </p>
              </div>
              <span
                className={
                  c.status === 'active' ? 'badge-green' : c.status === 'suspended' ? 'badge-red' : 'badge-orange'
                }
              >
                {c.status === 'active' ? 'Actif' : c.status === 'suspended' ? 'Suspendu' : 'En attente'}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {c.documents
                .filter((d) => d.fileName)
                .map((d) => (
                  <li key={d.key} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 font-semibold text-ink">
                      {d.status === 'verified' ? '🟢' : d.status === 'rejected' ? '🔴' : '🟠'} {d.label}
                    </span>
                    <form action={setCourierDoc.bind(null, c.id, d.key, 'verified')}>
                      <button type="submit" className="font-extrabold text-brand">
                        OK
                      </button>
                    </form>
                  </li>
                ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={setCourier.bind(null, c.id, 'active')}>
                <button type="submit" className="btn-primary !h-10 text-sm">
                  Activer
                </button>
              </form>
              <form action={setCourier.bind(null, c.id, 'suspended')}>
                <button type="submit" className="btn-secondary !h-10 text-sm">
                  Suspendre
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
