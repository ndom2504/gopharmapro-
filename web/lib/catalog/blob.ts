import { put } from '@vercel/blob';
import { CatalogError } from './validations';
import { loadRootEnv } from '@/lib/loadRootEnv';

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const PRESCRIPTION_MAX_BYTES = 5 * 1024 * 1024;
export const PRESCRIPTION_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

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

export function validatePrescriptionFile(file: File) {
  const type = (file.type || '').toLowerCase();
  if (!PRESCRIPTION_TYPES.includes(type as (typeof PRESCRIPTION_TYPES)[number])) {
    throw new CatalogError(400, 'Format non accepté. Utilisez PDF, JPEG, PNG ou WEBP.');
  }
  if (file.size <= 0) throw new CatalogError(400, 'Fichier vide.');
  if (file.size > PRESCRIPTION_MAX_BYTES) {
    throw new CatalogError(400, 'Le fichier dépasse 5 Mo.');
  }
  return type;
}

function prescriptionExt(type: string) {
  if (type === 'application/pdf') return 'pdf';
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

export async function uploadOrderPrescription(file: File) {
  const type = validatePrescriptionFile(file);
  if (!blobConfigured()) {
    throw new CatalogError(
      503,
      'Stockage fichiers non configuré. Ajoutez BLOB_READ_WRITE_TOKEN (Vercel Blob) dans web/.env.local et les variables Vercel.',
    );
  }
  const safe = `orders/prescriptions/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${prescriptionExt(type)}`;
  const uploaded = await put(safe, file, {
    access: 'public',
    token: blobToken(),
    contentType: type,
    addRandomSuffix: true,
  });
  return { url: uploaded.url, contentType: type };
}
