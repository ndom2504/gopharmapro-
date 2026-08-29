'use client';

import { RequireRole } from '@/components/RequireRole';
import { RoleSubnav, pharmacyNav } from '@/components/RoleSubnav';
import { ProductPhoto } from '@/components/ProductPhoto';
import { useShop } from '@/components/ShopProvider';
import { isPharmacy, partnerCatalog } from '@/lib/accounts';
import { formatFcfa } from '@/lib/catalog';
import { productImageSrc } from '@/lib/photos';

export default function PharmacyProductsPage() {
  const { session } = useShop();
  const catalog = isPharmacy(session) ? partnerCatalog.filter((i) => i.pharmacyId === session.id) : [];
  return (
    <RequireRole role="pharmacy">
      <main className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <RoleSubnav items={pharmacyNav} />
        <h1 className="text-3xl font-extrabold text-ink">Produits</h1>
        <p className="mt-2 text-sm text-muted">{catalog.length} produit(s) dans votre officine.</p>
        <div className="mt-6 space-y-3">
          {catalog.map((item) => (
            <div key={item.id} className="card flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4">
              <ProductPhoto src={productImageSrc(item.imageKey)} alt={item.name} size="thumb" />
              <div className="min-w-0 flex-1">
                <p className="break-words font-extrabold text-ink">{item.name}</p>
                <p className="text-sm text-muted">
                  {item.category} · {formatFcfa(item.price)} · stock {item.stock}
                </p>
              </div>
              <span className={`shrink-0 ${item.status === 'published' ? 'badge-green' : 'badge-orange'}`}>
                {item.status === 'published' ? 'Publié' : 'En revue'}
              </span>
            </div>
          ))}
        </div>
      </main>
    </RequireRole>
  );
}
