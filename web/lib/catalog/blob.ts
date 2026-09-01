import { put } from '@vercel/blob';
import { CatalogError } from './validations';
import { loadRootEnv } from '@/lib/loadRootEnv';

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function blobToken() {
  loadRootEnv();
  return (process.env.BLOB_READ_WRITE_TOKEN || '').trim();
}

export function blobConfigured() {
  return Boolean(blobToken());
}

export function validateProductImage(file: File) {
  const type = (file.type || '').toLowerCase();
  if (!PRODUCT_IMAGE_TYPES.includes(type as (typeof PRODUCT_IMAGE_TYPES)[number])) {
    throw new CatalogError(400, 'Format d’image non accepté. Utilisez JPEG, PNG ou WEBP.');
  }
  if (file.size <= 0) throw new CatalogError(400, 'Fichier image vide.');
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    throw new CatalogError(400, 'L’image dépasse 5 Mo.');
  }
  return type;
}

function extFor(type: string) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadProductImage(file: File) {
  const type = validateProductImage(file);
  if (!blobConfigured()) {
    throw new CatalogError(
      503,
      'Stockage images non configuré. Ajoutez BLOB_READ_WRITE_TOKEN (Vercel Blob) dans web/.env.local et les variables Vercel.',
    );
  }
  const safe = `catalog/products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extFor(type)}`;
  const uploaded = await put(safe, file, {
    access: 'public',
    token: blobToken(),
    contentType: type,
    addRandomSuffix: true,
  });
  return { url: uploaded.url, contentType: type };
}
