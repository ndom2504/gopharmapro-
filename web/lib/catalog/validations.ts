import { productCountryStatuses, type OfferInput, type ProductCountryStatus } from './types';

export class CatalogError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'CatalogError';
  }
}

export function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function parseCountryCode(value: string | null | undefined) {
  const code = String(value || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

export function parsePage(value: string | null) {
  const n = Number(value || 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), 1000);
}

export function parseLimit(value: string | null, fallback = 20) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.floor(n), 50);
}

export function parseBool(value: string | null) {
  if (value == null || value === '') return undefined;
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return undefined;
}

export function parseCoord(value: string | null) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function parseRadiusKm(value: string | null) {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(n, 200);
}

export function parseStatus(value: unknown): ProductCountryStatus | null {
  const s = String(value || '').toUpperCase();
  return productCountryStatuses.includes(s as ProductCountryStatus) ? (s as ProductCountryStatus) : null;
}

export function assertOfferInput(body: Record<string, unknown>): OfferInput {
  const productId = String(body.productId || '').trim();
  if (!productId) throw new CatalogError(400, 'productId requis.');
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) throw new CatalogError(400, 'Le prix ne peut pas être négatif.');
  const stockQuantity = Number(body.stockQuantity);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    throw new CatalogError(400, 'Le stock ne peut pas être négatif.');
  }
  return {
    productId,
    price,
    stockQuantity,
    available: body.available !== false,
    deliveryAvailable: Boolean(body.deliveryAvailable),
    pickupAvailable: body.pickupAvailable !== false,
    internalReference: body.internalReference == null ? null : String(body.internalReference).trim() || null,
  };
}

export function assertOfferPatch(body: Record<string, unknown>) {
  const patch: {
    price?: number;
    stockQuantity?: number;
    available?: boolean;
    deliveryAvailable?: boolean;
    pickupAvailable?: boolean;
    internalReference?: string | null;
  } = {};
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) throw new CatalogError(400, 'Le prix ne peut pas être négatif.');
    patch.price = price;
  }
  if (body.stockQuantity !== undefined) {
    const stockQuantity = Number(body.stockQuantity);
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      throw new CatalogError(400, 'Le stock ne peut pas être négatif.');
    }
    patch.stockQuantity = stockQuantity;
  }
  if (body.available !== undefined) patch.available = Boolean(body.available);
  if (body.deliveryAvailable !== undefined) patch.deliveryAvailable = Boolean(body.deliveryAvailable);
  if (body.pickupAvailable !== undefined) patch.pickupAvailable = Boolean(body.pickupAvailable);
  if (body.internalReference !== undefined) {
    patch.internalReference = body.internalReference == null ? null : String(body.internalReference).trim() || null;
  }
  if (!Object.keys(patch).length) throw new CatalogError(400, 'Aucune modification.');
  return patch;
}

export function assertProductInput(body: Record<string, unknown>, partial = false) {
  const name = body.name == null ? undefined : String(body.name).trim();
  if (!partial && !name) throw new CatalogError(400, 'Nom du produit requis.');
  const categoryId = body.categoryId == null ? undefined : String(body.categoryId).trim();
  if (!partial && !categoryId) throw new CatalogError(400, 'categoryId requis.');
  return {
    categoryId,
    name,
    slug: body.slug == null ? undefined : slugify(String(body.slug || name || '')),
    genericName: body.genericName == null ? undefined : String(body.genericName).trim() || null,
    brandName: body.brandName == null ? undefined : String(body.brandName).trim() || null,
    activeIngredient: body.activeIngredient == null ? undefined : String(body.activeIngredient).trim() || null,
    dosage: body.dosage == null ? undefined : String(body.dosage).trim() || null,
    dosageUnit: body.dosageUnit == null ? undefined : String(body.dosageUnit).trim() || null,
    pharmaceuticalForm: body.pharmaceuticalForm == null ? undefined : String(body.pharmaceuticalForm).trim() || null,
    packaging: body.packaging == null ? undefined : String(body.packaging).trim() || null,
    description: body.description == null ? undefined : String(body.description).trim() || null,
    requiresPrescription: body.requiresPrescription == null ? undefined : Boolean(body.requiresPrescription),
    imageUrl: body.imageUrl == null ? undefined : String(body.imageUrl).trim() || null,
    active: body.active == null ? undefined : Boolean(body.active),
  };
}

export function assertCategoryInput(body: Record<string, unknown>, partial = false) {
  const name = body.name == null ? undefined : String(body.name).trim();
  if (!partial && !name) throw new CatalogError(400, 'Nom de catégorie requis.');
  const countryId = body.countryId == null ? undefined : String(body.countryId).trim();
  if (!partial && !countryId) throw new CatalogError(400, 'countryId requis.');
  return {
    countryId,
    name,
    slug: body.slug == null ? undefined : slugify(String(body.slug || name || '')),
    description: body.description == null ? undefined : String(body.description).trim() || null,
    active: body.active == null ? undefined : Boolean(body.active),
    sortOrder: body.sortOrder == null ? undefined : Number(body.sortOrder) || 0,
  };
}

export function kmBetween(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
