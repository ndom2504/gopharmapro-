import { setProductStatus } from '@/app/admin/actions';
import { getAdminState } from '@/lib/adminData';
import { formatFcfa } from '@/lib/catalog';
import { productImageSrc } from '@/lib/photos';
import { ProductPhoto } from '@/components/ProductPhoto';

export const metadata = { title: 'Catalogue' };
export const dynamic = 'force-dynamic';

export default function AdminCatalogPage() {
  const items = [...getAdminState().catalog].sort(
    (a, b) => Number(a.status === 'published') - Number(b.status === 'published'),
  );
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Catalogue</h1>
      <p className="mt-2 text-sm text-muted">
        Publier un produit le rend visible sur le site. Les produits avec ordonnance restent en contrôle jusqu’à
        validation.
      </p>
      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const src = productImageSrc(item.imageKey);
          return (
            <div key={item.id} className="card flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="flex min-w-0 flex-1 gap-4">
                {src ? <ProductPhoto src={src} alt={item.name} size="thumb" /> : null}
                <div>
                  <p className="font-extrabold text-ink">{item.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.pharmacyName} · {item.category}
                    {item.requiresPrescription ? ' · Ordonnance' : ''} · {formatFcfa(item.price)} · {item.stock}{' '}
                    en stock
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={item.status === 'published' ? 'badge-green' : 'badge-orange'}>
                  {item.status === 'published' ? 'Publié' : 'Contrôle'}
                </span>
                {item.status === 'review' ? (
                  <form action={setProductStatus.bind(null, item.id, 'published')}>
                    <button type="submit" className="btn-primary !h-10 text-sm">
                      Publier
                    </button>
                  </form>
                ) : (
                  <form action={setProductStatus.bind(null, item.id, 'review')}>
                    <button type="submit" className="btn-secondary !h-10 text-sm">
                      Remettre en contrôle
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
