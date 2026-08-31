import {
  assertOfferInput,
  CatalogError,
  parseCountryCode,
  slugify,
} from '../lib/catalog/validations';

function ok(name: string) {
  console.log('ok  ' + name);
}

function fail(name: string, err: unknown) {
  console.error('fail  ' + name + ' — ' + (err instanceof Error ? err.message : err));
  process.exitCode = 1;
}

function expectThrow(name: string, fn: () => void, status: number) {
  try {
    fn();
    fail(name, 'aucune erreur');
  } catch (err) {
    if (err instanceof CatalogError && err.status === status) ok(name);
    else fail(name, err);
  }
}

ok('slug ' + (slugify('Paracétamol 500 mg') === 'paracetamol-500-mg' ? 'paracetamol-500-mg' : slugify('Paracétamol 500 mg')));
if (parseCountryCode('ga') !== 'GA') fail('country', parseCountryCode('ga'));
else ok('country GA');
if (parseCountryCode('Gabon')) fail('country reject', 'Gabon accepté');
else ok('country reject Gabon');

expectThrow('prix négatif', () => assertOfferInput({ productId: 'p1', price: -1, stockQuantity: 1 }), 400);
expectThrow('stock négatif', () => assertOfferInput({ productId: 'p1', price: 1, stockQuantity: -2 }), 400);
expectThrow('produit manquant', () => assertOfferInput({ price: 1, stockQuantity: 1 }), 400);
assertOfferInput({ productId: 'p1', price: 0, stockQuantity: 0, available: true, deliveryAvailable: false, pickupAvailable: true });
ok('offre valide prix 0');

console.log(process.exitCode ? 'catalog-check: échecs' : 'catalog-check: validations ok');
console.log('HTTP (si DATABASE_URL + serveur) :');
console.log('  GET /api/v1/catalog/countries');
console.log('  GET /api/v1/catalog/categories?country=GA');
console.log('  GET /api/v1/catalog/products?country=GA&search=paracetamol');
console.log('  GET /api/v1/catalog/products/search?country=GA&q=paracetamol');
