import { addPharmacyOffer, deletePharmacyOffer, listProducts, patchPharmacyOffer } from '../lib/catalog/queries';
import { createPharmacy, listPharmacies } from '../lib/catalog/pharmacyQueries';
import { CatalogError } from '../lib/catalog/validations';
import { catalogDb } from '../lib/prisma';

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
  const db = catalogDb();
  let testPharmacyId = '';
  let offerProductId = '';
  try {
    const pharmacies = await listPharmacies({ includeInactive: true });
    if (pharmacies.length < 2) throw new Error('pharmacies seed manquantes');
    ok('liste pharmacies');

    const centre = pharmacies.find((p) => p.accountId === 'ph-centre');
    if (!centre) throw new Error('ph-centre introuvable');

    const gaProducts = await listProducts({ country: 'GA', page: 1, limit: 20, includeInactive: true });
    const already = new Set(
      (await db.pharmacyProduct.findMany({ where: { pharmacyId: centre.id }, select: { productId: true } })).map((o) => o.productId),
    );
    const product = gaProducts.products.find((p) => !already.has(p.id));
    if (!product) throw new Error('aucun produit Gabon libre pour le test');

    const created = await createPharmacy({
      name: `Test pharmacie ${stamp}`,
      legalName: `Test pharmacie ${stamp} SARL`,
      countryCode: 'CM',
      email: `test-pharma-${stamp}@example.com`,
      city: 'Douala',
      latitude: 4.0511,
      longitude: 9.7679,
    });
    testPharmacyId = created.id;
    ok('création pharmacie Cameroun');

    await expectStatus(
      'produit autre pays',
      () =>
        addPharmacyOffer(created.id, {
          productId: product.id,
          price: 1000,
          stockQuantity: 5,
          available: true,
          deliveryAvailable: true,
          pickupAvailable: true,
        }),
      400,
    );

    const countryLink = await db.productCountry.findUnique({
      where: { productId_countryId: { productId: product.id, countryId: centre.countryId } },
    });
    if (countryLink) {
      await db.productCountry.update({ where: { id: countryLink.id }, data: { active: false } });
      await expectStatus(
        'productCountry inactif',
        () =>
          addPharmacyOffer(centre.id, {
            productId: product.id,
            price: 1800,
            stockQuantity: 7,
            available: true,
            deliveryAvailable: false,
            pickupAvailable: true,
          }),
        400,
      );
      await db.productCountry.update({ where: { id: countryLink.id }, data: { active: true } });
    }

    await addPharmacyOffer(centre.id, {
      productId: product.id,
      price: 1800,
      stockQuantity: 7,
      available: true,
      deliveryAvailable: false,
      pickupAvailable: true,
    });
    offerProductId = product.id;
    ok('ajout offre');

    await expectStatus(
      'doublon offre',
      () =>
        addPharmacyOffer(centre.id, {
          productId: product.id,
          price: 2000,
          stockQuantity: 1,
          available: true,
          deliveryAvailable: true,
          pickupAvailable: true,
        }),
      409,
    );

    const patched = await patchPharmacyOffer(centre.id, product.id, { price: 1900, stockQuantity: 8 });
    if (Number(patched.price) !== 1900) throw new Error('prix non mis à jour');
    ok('modification offre');

    ok('contrainte unique pharmacy+product');
  } catch (err) {
    fail('module pharmacie', err);
  } finally {
    if (testPharmacyId) {
      await db.pharmacy.delete({ where: { id: testPharmacyId } }).catch(() => undefined);
    }
    if (offerProductId) {
      const centre = await db.pharmacy.findUnique({ where: { accountId: 'ph-centre' } });
      if (centre) await deletePharmacyOffer(centre.id, offerProductId).catch(() => undefined);
    }
  }
}

main().then(() => {
  console.log(process.exitCode ? 'pharmacy-module-check: échecs' : 'pharmacy-module-check: ok');
});
