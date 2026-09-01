import type { Prisma } from '@prisma/client';
import { catalogDb } from '@/lib/prisma';
import { CatalogError, kmBetween, parseCountryCode, slugify } from '@/lib/catalog/validations';
import { cityOrigin } from './cities';

export type ClientSort = 'relevance' | 'price' | 'nearest' | 'availability';

function searchFilter(term: string): Prisma.ProductWhereInput {
  const q = term.trim();
  if (!q) return {};
  const slug = slugify(q);
  return {
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { genericName: { contains: q, mode: 'insensitive' } },
      { brandName: { contains: q, mode: 'insensitive' } },
      { activeIngredient: { contains: q, mode: 'insensitive' } },
      ...(slug ? [{ slug: { contains: slug, mode: 'insensitive' as const } }] : []),
    ],
  };
}

function relevanceScore(name: string, genericName: string | null, term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return 0;
  const n = name.toLowerCase();
  const g = (genericName || '').toLowerCase();
  if (n === q || g === q) return 0;
  if (n.startsWith(q) || g.startsWith(q)) return 1;
  if (n.includes(q) || g.includes(q)) return 2;
  return 3;
}

export async function searchClientOffers(input: {
  country: string;
  search?: string | null;
  category?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sort?: ClientSort;
}) {
  const code = parseCountryCode(input.country);
  if (!code) throw new CatalogError(400, 'Code pays invalide.');
  const country = await catalogDb().country.findUnique({ where: { code } });
  if (!country || !country.active) throw new CatalogError(400, 'Pays inexistant.');

  const category = input.category?.trim();
  const origin =
    input.latitude != null && input.longitude != null
      ? { latitude: input.latitude, longitude: input.longitude }
      : cityOrigin(code, input.city);

  const rows = await catalogDb().pharmacyProduct.findMany({
    where: {
      available: true,
      stockQuantity: { gt: 0 },
      pharmacy: {
        active: true,
        verified: true,
        countryId: country.id,
        ...(input.city ? { city: { equals: input.city, mode: 'insensitive' } } : {}),
      },
      product: {
        active: true,
        countryStatuses: { some: { countryId: country.id, active: true } },
        ...(category ? { category: { OR: [{ id: category }, { slug: category }, { name: { equals: category, mode: 'insensitive' } }] } } : {}),
        ...searchFilter(input.search || ''),
      },
    },
    include: {
      pharmacy: true,
      product: { include: { category: true, countryStatuses: { where: { countryId: country.id } } } },
    },
    take: 80,
  });

  const mapped = rows.map((row) => {
    const pc = row.product.countryStatuses[0];
    const requires = pc?.requiresPrescription ?? row.product.requiresPrescription;
    const lat = row.pharmacy.latitude;
    const lng = row.pharmacy.longitude;
    const distanceKm =
      origin && lat != null && lng != null ? Math.round(kmBetween(origin, { latitude: lat, longitude: lng }) * 10) / 10 : null;
    return {
      product: {
        id: row.product.id,
        name: row.product.name,
        genericName: row.product.genericName,
        dosage: row.product.dosage,
        dosageUnit: row.product.dosageUnit,
        pharmaceuticalForm: row.product.pharmaceuticalForm,
        description: row.product.description,
        imageUrl: row.product.imageUrl,
        imageAlt: row.product.imageAlt || row.product.name,
        category: { id: row.product.category.id, name: row.product.category.name },
        requiresPrescription: requires,
      },
      pharmacy: {
        id: row.pharmacy.id,
        name: row.pharmacy.name,
        city: row.pharmacy.city,
        address: row.pharmacy.address,
        phone: row.pharmacy.phone,
        latitude: lat,
        longitude: lng,
        verified: row.pharmacy.verified,
      },
      offer: {
        id: row.id,
        price: Number(row.price),
        currency: row.currency,
        stockQuantity: row.stockQuantity,
        available: row.available,
        deliveryAvailable: row.deliveryAvailable,
        pickupAvailable: row.pickupAvailable,
      },
      distanceKm,
      countryCode: code,
    };
  });

  const sort = input.sort || 'relevance';
  mapped.sort((a, b) => {
    if (sort === 'price') return a.offer.price - b.offer.price;
    if (sort === 'nearest') {
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    }
    if (sort === 'availability') {
      if (a.offer.available !== b.offer.available) return a.offer.available ? -1 : 1;
      return b.offer.stockQuantity - a.offer.stockQuantity;
    }
    const ra = relevanceScore(a.product.name, a.product.genericName, input.search || '');
    const rb = relevanceScore(b.product.name, b.product.genericName, input.search || '');
    if (ra !== rb) return ra - rb;
    return a.offer.price - b.offer.price;
  });

  return { country: code, total: mapped.length, results: mapped };
}

export async function getClientOffer(pharmacyId: string, productId: string) {
  const row = await catalogDb().pharmacyProduct.findFirst({
    where: {
      productId,
      pharmacy: { OR: [{ id: pharmacyId }, { accountId: pharmacyId }], active: true, verified: true },
      available: true,
      stockQuantity: { gt: 0 },
      product: { active: true },
    },
    include: {
      pharmacy: { include: { country: true } },
      product: { include: { category: true, countryStatuses: true } },
    },
  });
  if (!row) throw new CatalogError(404, 'Offre introuvable.');
  const pc = row.product.countryStatuses.find((s) => s.countryId === row.pharmacy.countryId);
  if (!pc || !pc.active) throw new CatalogError(404, 'Ce produit n’est pas proposé dans ce pays.');
  const requires = pc.requiresPrescription ?? row.product.requiresPrescription;
  return {
    product: {
      id: row.product.id,
      name: row.product.name,
      genericName: row.product.genericName,
      dosage: row.product.dosage,
      dosageUnit: row.product.dosageUnit,
      pharmaceuticalForm: row.product.pharmaceuticalForm,
      description: row.product.description,
      imageUrl: row.product.imageUrl,
      imageAlt: row.product.imageAlt || row.product.name,
      category: { id: row.product.category.id, name: row.product.category.name },
      requiresPrescription: requires,
    },
    pharmacy: {
      id: row.pharmacy.id,
      name: row.pharmacy.name,
      city: row.pharmacy.city,
      address: row.pharmacy.address,
      phone: row.pharmacy.phone,
      latitude: row.pharmacy.latitude,
      longitude: row.pharmacy.longitude,
      verified: row.pharmacy.verified,
      country: { code: row.pharmacy.country.code, name: row.pharmacy.country.name, currencySymbol: row.pharmacy.country.currencySymbol },
    },
    offer: {
      id: row.id,
      price: Number(row.price),
      currency: row.currency,
      stockQuantity: row.stockQuantity,
      available: row.available,
      deliveryAvailable: row.deliveryAvailable,
      pickupAvailable: row.pickupAvailable,
    },
  };
}
