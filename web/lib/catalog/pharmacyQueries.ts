import { catalogDb } from '@/lib/prisma';
import { CatalogError, parseCountryCode } from './validations';

export function serializePharmacy(
  row: {
    id: string;
    accountId: string | null;
    name: string;
    legalName: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    active: boolean;
    verified: boolean;
    countryId: string;
    country: { id: string; code: string; name: string; currency: string; currencySymbol: string };
  },
  opts: { includeContact?: boolean } = {},
) {
  return {
    id: row.id,
    accountId: row.accountId,
    name: row.name,
    legalName: row.legalName,
    country: {
      id: row.country.id,
      code: row.country.code,
      name: row.country.name,
      currency: row.country.currency,
      currencySymbol: row.country.currencySymbol,
    },
    address: row.address,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    active: row.active,
    verified: row.verified,
    ...(opts.includeContact ? { email: row.email, phone: row.phone } : {}),
  };
}

export function serializePharmacyOffer(offer: {
  id: string;
  productId: string;
  price: { toString(): string } | number;
  currency: string;
  stockQuantity: number;
  available: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  product: {
    name: string;
    genericName: string | null;
    dosage: string | null;
    dosageUnit: string | null;
    pharmaceuticalForm: string | null;
    requiresPrescription: boolean;
    category: { id: string; name: string };
  };
}) {
  return {
    id: offer.id,
    productId: offer.productId,
    name: offer.product.name,
    genericName: offer.product.genericName,
    category: offer.product.category.name,
    categoryId: offer.product.category.id,
    dosage: offer.product.dosage,
    dosageUnit: offer.product.dosageUnit,
    pharmaceuticalForm: offer.product.pharmaceuticalForm,
    price: Number(offer.price),
    currency: offer.currency,
    stockQuantity: offer.stockQuantity,
    available: offer.available,
    deliveryAvailable: offer.deliveryAvailable,
    pickupAvailable: offer.pickupAvailable,
    requiresPrescription: offer.product.requiresPrescription,
  };
}

export async function listPharmacies(input: { country?: string | null; includeInactive?: boolean } = {}) {
  const code = input.country ? parseCountryCode(input.country) : null;
  if (input.country && !code) throw new CatalogError(400, 'Code pays invalide.');
  return catalogDb().pharmacy.findMany({
    where: {
      ...(input.includeInactive ? {} : { active: true }),
      ...(code ? { country: { code } } : {}),
    },
    include: { country: true },
    orderBy: { name: 'asc' },
  });
}

export async function getPharmacyById(id: string) {
  const row = await catalogDb().pharmacy.findFirst({
    where: { OR: [{ id }, { accountId: id }] },
    include: { country: true },
  });
  if (!row) throw new CatalogError(404, 'Pharmacie introuvable.');
  return row;
}

export async function createPharmacy(input: {
  name: string;
  legalName?: string | null;
  countryCode: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email: string;
  latitude?: number | null;
  longitude?: number | null;
  accountId?: string | null;
  verified?: boolean;
  active?: boolean;
}) {
  const db = catalogDb();
  const code = parseCountryCode(input.countryCode);
  if (!code) throw new CatalogError(400, 'Pays inexistant.');
  const country = await db.country.findUnique({ where: { code } });
  if (!country || !country.active) throw new CatalogError(400, 'Pays inexistant.');
  if (input.accountId) {
    const taken = await db.pharmacy.findUnique({ where: { accountId: input.accountId } });
    if (taken) throw new CatalogError(409, 'Cette pharmacie existe déjà.');
  }
  return db.pharmacy.create({
    data: {
      name: input.name,
      legalName: input.legalName,
      countryId: country.id,
      address: input.address,
      city: input.city,
      phone: input.phone,
      email: input.email,
      latitude: input.latitude,
      longitude: input.longitude,
      accountId: input.accountId,
      verified: input.verified ?? false,
      active: input.active ?? true,
    },
    include: { country: true },
  });
}

export async function listPharmacyOffers(pharmacyId: string) {
  return catalogDb().pharmacyProduct.findMany({
    where: { pharmacyId },
    include: { product: { include: { category: true } } },
    orderBy: { updatedAt: 'desc' },
  });
}

export function assertPharmacyInput(body: Record<string, unknown>) {
  const name = String(body.name || '').trim();
  if (!name) throw new CatalogError(400, 'Nom de la pharmacie requis.');
  const email = String(body.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) throw new CatalogError(400, 'Email invalide.');
  const countryCode = String(body.country || body.countryCode || '').trim();
  if (!countryCode) throw new CatalogError(400, 'Pays requis.');
  const lat = body.latitude == null || body.latitude === '' ? null : Number(body.latitude);
  const lng = body.longitude == null || body.longitude === '' ? null : Number(body.longitude);
  if (lat != null && !Number.isFinite(lat)) throw new CatalogError(400, 'Latitude invalide.');
  if (lng != null && !Number.isFinite(lng)) throw new CatalogError(400, 'Longitude invalide.');
  return {
    name,
    legalName: body.legalName == null ? null : String(body.legalName).trim() || null,
    countryCode,
    address: body.address == null ? null : String(body.address).trim() || null,
    city: body.city == null ? null : String(body.city).trim() || null,
    phone: body.phone == null ? null : String(body.phone).trim() || null,
    email,
    latitude: lat,
    longitude: lng,
    accountId: body.accountId == null ? null : String(body.accountId).trim() || null,
    verified: body.verified == null ? undefined : Boolean(body.verified),
    active: body.active == null ? undefined : Boolean(body.active),
  };
}
