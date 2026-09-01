import { catalogDbAvailable } from '@/lib/prisma';
import { getActiveCountries } from '@/lib/catalog/queries';
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
  const countries = await getActiveCountries();
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-ink">Catalogue central</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Produits Gopharmapro, distincts des offres pharmacies. Le statut réglementaire d’un pays n’est jamais déduit :
        il doit être vérifié explicitement. Toute création commence en « À vérifier ».
      </p>
      <CatalogueAdmin countries={countries.map((c) => ({ id: c.id, code: c.code, name: c.name }))} />
    </div>
  );
}
