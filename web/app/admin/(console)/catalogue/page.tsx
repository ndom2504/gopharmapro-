import { catalogDbAvailable } from '@/lib/prisma';
import { adminListCatalog } from '@/lib/catalog/queries';
import { CatalogueAdmin } from '@/components/CatalogueAdmin';

export const metadata = { title: 'Catalogue central' };
export const dynamic = 'force-dynamic';

export default async function AdminCataloguePage() {
  if (!catalogDbAvailable()) {
    return (
      <div>
        <h1 className="text-3xl font-extrabold text-ink">Catalogue central</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          La base Neon n’est pas encore connectée. Ajoutez <code>DATABASE_URL</code> puis exécutez{' '}
          <code>npx prisma migrate deploy</code> et <code>npx prisma db seed</code> dans le dossier <code>web/</code>.
        </p>
      </div>
    );
  }
  const data = await adminListCatalog();
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Catalogue central</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Produits Gopharmapro, distincts des offres pharmacies. Le statut réglementaire d’un pays n’est jamais déduit :
        il doit être vérifié explicitement.
      </p>
      <CatalogueAdmin
        countries={data.countries.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
        categories={data.categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          active: c.active,
          countryCode: c.country.code,
          countryId: c.countryId,
        }))}
        products={data.products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          genericName: p.genericName,
          dosage: p.dosage,
          dosageUnit: p.dosageUnit,
          pharmaceuticalForm: p.pharmaceuticalForm,
          active: p.active,
          requiresPrescription: p.requiresPrescription,
          categoryName: p.category.name,
          categoryId: p.categoryId,
          countryCode: p.category.country.code,
          statuses: p.countryStatuses.map((s) => ({
            countryId: s.countryId,
            countryCode: s.country.code,
            status: s.status,
            verified: s.verified,
            requiresPrescription: s.requiresPrescription,
          })),
        }))}
      />
    </div>
  );
}
