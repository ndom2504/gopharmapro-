import { CatalogError } from '../lib/catalog/validations';
import { blobConfigured, validateProductImage } from '../lib/catalog/blob';

function ok(name: string) {
  console.log('ok  ' + name);
}

function fail(name: string, err: unknown) {
  console.error('fail  ' + name + ' — ' + (err instanceof Error ? err.message : err));
  process.exitCode = 1;
}

function expectStatus(name: string, fn: () => void, status: number) {
  try {
    fn();
    fail(name, 'aucune erreur');
  } catch (err) {
    if (err instanceof CatalogError && err.status === status) ok(name);
    else fail(name, err);
  }
}

function fakeFile(type: string, size: number) {
  return { type, size } as File;
}

expectStatus('fichier non-image', () => validateProductImage(fakeFile('application/pdf', 100)), 400);
expectStatus('fichier trop volumineux', () => validateProductImage(fakeFile('image/jpeg', 5 * 1024 * 1024 + 10)), 400);
validateProductImage(fakeFile('image/jpeg', 1200));
ok('JPEG accepté');
validateProductImage(fakeFile('image/png', 800));
ok('PNG accepté');
validateProductImage(fakeFile('image/webp', 800));
ok('WEBP accepté');
ok(blobConfigured() ? 'BLOB_READ_WRITE_TOKEN présent' : 'BLOB_READ_WRITE_TOKEN absent (503 attendu à l’upload réel)');

console.log(process.exitCode ? 'catalog-image-check: échecs' : 'catalog-image-check: ok');
