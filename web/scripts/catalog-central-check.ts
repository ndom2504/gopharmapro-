import {
  createCatalogProduct,
  deactivateCatalogProduct,
  getProduct,
  listCategories,
  listProducts,
  updateCatalogProduct,
} from '../lib/catalog/queries';
import { CatalogError } from '../lib/catalog/validations';

function ok(name: string) {
  console.log('ok  ' + name);
}

function fail(name: string, err: unknown) {
  console.error('fail  ' + name + ' — ' + (err instanceof Error ? err.message : err));
  process.exitCode = 1;
}

async function expectStatus(name: string, fn: () => Promise<unknown>, status: number) {
  try {
    await fn();
    fail(name, 'aucune erreur');
  } catch (err) {
    if (err instanceof CatalogError && err.status === status) ok(name);
    else fail(name, err);
  }
}

async function main() {
  const stamp = Date.now();
  const created: string[] = [];
  try {
    const [gaCats, cmCats, bjCats] = await Promise.all([
      listCategories('GA'),
      listCategories('CM'),
      listCategories('BJ'),
    ]);
    if (!gaCats[0] || !cmCats[0] || !bjCats[0]) throw new Error('Catégories manquantes');

    const ga = await createCatalogProduct({
      name: `Test catalogue ${stamp} Gabon`,
      categoryId: gaCats[0].id,
      countryCode: 'GA',
      genericName: 'Paracetamol',
      dosage: '500 mg',
      pharmaceuticalForm: 'Comprimé',
      requiresPrescription: false,
    });
    created.push(ga.id);
    if (ga.countryStatuses[0]?.status !== 'PENDING_REVIEW') throw new Error('statut GA');
    ok('création Gabon');

    const cm = await createCatalogProduct({
      name: `Test catalogue ${stamp} Cameroun`,
      categoryId: cmCats[0].id,
      countryCode: 'CM',
      genericName: 'Amoxicilline',
      dosage: '500 mg',
      pharmaceuticalForm: 'Gélule',
      requiresPrescription: true,
    });
    created.push(cm.id);
    ok('création Cameroun');

    const bj = await createCatalogProduct({
      name: `Test catalogue ${stamp} Benin`,
      categoryId: bjCats[0].id,
      countryCode: 'BJ',
      genericName: 'Artemether',
      dosage: '80 mg',
      pharmaceuticalForm: 'Comprimé',
      requiresPrescription: false,
    });
    created.push(bj.id);
    ok('création Bénin');

    const search = await listProducts({
      country: 'GA',
      search: 'paracetamol',
      page: 1,
      limit: 20,
      includeInactive: true,
    });
    if (!search.products.some((p) => p.id === ga.id || /paracetamol/i.test(p.genericName || p.name))) {
      throw new Error('recherche vide');
    }
    ok('recherche');

    const byCat = await listProducts({
      country: 'CM',
      category: cmCats[0].id,
      page: 1,
      limit: 20,
      includeInactive: true,
    });
    if (!byCat.products.some((p) => p.id === cm.id)) throw new Error('filtre catégorie');
    ok('filtre catégorie');

    const byRx = await listProducts({
      country: 'CM',
      prescriptionRequired: true,
      page: 1,
      limit: 20,
      includeInactive: true,
    });
    if (!byRx.products.some((p) => p.id === cm.id)) throw new Error('filtre ordonnance');
    ok('filtre ordonnance');

    const updated = await updateCatalogProduct(ga.id, { name: `Test catalogue ${stamp} Gabon modifié`, countryCode: 'GA' });
    if (!updated.name.includes('modifié')) throw new Error('modification');
    ok('modification');

    const off = await deactivateCatalogProduct(bj.id);
    if (off.active) throw new Error('désactivation');
    ok('désactivation');

    await expectStatus(
      'doublon',
      () =>
        createCatalogProduct({
          name: `Test catalogue ${stamp} Cameroun`,
          categoryId: cmCats[0].id,
          countryCode: 'CM',
        }),
      409,
    );
    await expectStatus('produit inexistant', () => getProduct('missing-product-id'), 404);
  } catch (err) {
    fail('catalogue central', err);
  } finally {
    for (const id of created) {
      try {
        await deactivateCatalogProduct(id);
      } catch {
        /* ignore */
      }
    }
  }
}

main().then(() => {
  console.log(process.exitCode ? 'catalog-central-check: échecs' : 'catalog-central-check: ok');
});
