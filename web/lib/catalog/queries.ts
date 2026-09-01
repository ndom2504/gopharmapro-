import type { Prisma } from '@prisma/client';
import { catalogDb } from '@/lib/prisma';
import { regulatoryLabel, type OfferInput, type PublicProduct, type RegulatoryPublic } from './types';
import { CatalogError, kmBetween, parseCountryCode, slugify } from './validations';

const productInclude = {
  category: true,
  countryStatuses: { include: { country: true } },
} satisfies Prisma.ProductInclude;

type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function prescriptionHint(requires: boolean) {
  if (!requires) return null;
  return 'Ce produit peut nécessiter une ordonnance. Le client pourra la soumettre ; le paiement suit les règles de validation de la pharmacie.';
}

function regulatoryOf(product: ProductRow, countryCode: string): RegulatoryPublic {
  const row = product.countryStatuses.find((s) => s.country.code === countryCode);
  const requires = row?.requiresPrescription ?? product.requiresPrescription;
  const status = row?.status || 'PENDING_REVIEW';
  const label = regulatoryLabel(status);
  return {
    status,
    label,
    requiresPrescription: requires,
    prescriptionRequired: requires,
    verified: row?.verified ?? false,
    verifiedAt: row?.verifiedAt ? row.verifiedAt.toISOString() : null,
    regulatoryReference: row?.regulatoryReference ?? null,
    regulatoryNote: row?.regulatoryNote ?? null,
  };
}

export function serializeProduct(product: ProductRow, countryCode: string): PublicProduct {
  const regulatory = regulatoryOf(product, countryCode);
  const country =
    product.countryStatuses.find((s) => s.country.code === countryCode)?.country ||
    product.countryStatuses[0]?.country;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    genericName: product.genericName,
    brandName: product.brandName,
    activeIngredient: product.activeIngredient,
    dosage: product.dosage,
    dosageUnit: product.dosageUnit,
    pharmaceuticalForm: product.pharmaceuticalForm,
    packaging: product.packaging,
    description: product.description,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
      description: product.category.description,
      sortOrder: product.category.sortOrder,
    },
    country: country
      ? { id: country.id, code: country.code, name: country.name }
      : { id: '', code: countryCode, name: countryCode },
    countryCode,
    active: product.active,
    requiresPrescription: regulatory.requiresPrescription,
    prescriptionRequired: regulatory.requiresPrescription,
    regulatory,
    regulatoryLabel: regulatory.label,
    prescriptionHint: prescriptionHint(regulatory.requiresPrescription),
  };
}

export async function getActiveCountries() {
  return catalogDb().country.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, code: true, name: true, currency: true, currencySymbol: true },
  });
}

export async function requireCountry(code: string) {
  const parsed = parseCountryCode(code);
  if (!parsed) throw new CatalogError(400, 'Code pays invalide.');
  const country = await catalogDb().country.findUnique({ where: { code: parsed } });
  if (!country || !country.active) throw new CatalogError(400, 'Pays inexistant.');
  return country;
}

export async function listCategories(countryCode?: string | null) {
  if (!countryCode) {
    return catalogDb().category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, description: true, sortOrder: true, countryId: true },
    });
  }
  const country = await requireCountry(countryCode);
  return catalogDb().category.findMany({
    where: { countryId: country.id, active: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true, description: true, sortOrder: true, countryId: true },
  });
}

function searchWhere(q: string): Prisma.ProductWhereInput {
  const term = q.trim();
  if (!term) return {};
  const slug = slugify(term);
  return {
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { genericName: { contains: term, mode: 'insensitive' } },
      { activeIngredient: { contains: term, mode: 'insensitive' } },
      { brandName: { contains: term, mode: 'insensitive' } },
      ...(slug ? [{ slug: { contains: slug, mode: 'insensitive' as const } }] : []),
    ],
  };
}

export async function listProducts(input: {
  country: string;
  category?: string | null;
  search?: string | null;
  page: number;
  limit: number;
  prescriptionRequired?: boolean;
  active?: boolean;
  includeInactive?: boolean;
}) {
  const country = await requireCountry(input.country);
  const categoryFilter = input.category?.trim();
  const and: Prisma.ProductWhereInput[] = [
    {
      countryStatuses: {
        some: {
          countryId: country.id,
          ...(input.includeInactive ? {} : { active: true, status: { not: 'INACTIVE' } }),
        },
      },
    },
  ];
  if (input.active === true) and.push({ active: true });
  else if (input.active === false) and.push({ active: false });
  else if (!input.includeInactive) and.push({ active: true });
  if (categoryFilter) {
    and.push({ category: { OR: [{ slug: categoryFilter }, { id: categoryFilter }] } });
  }
  if (input.prescriptionRequired != null) {
    and.push({
      OR: [
        { requiresPrescription: input.prescriptionRequired },
        { countryStatuses: { some: { countryId: country.id, requiresPrescription: input.prescriptionRequired } } },
      ],
    });
  }
  const search = searchWhere(input.search || '');
  if (Object.keys(search).length) and.push(search);
  const where: Prisma.ProductWhereInput = { AND: and };
  const skip = (input.page - 1) * input.limit;
  const [total, rows] = await catalogDb().$transaction([
    catalogDb().product.count({ where }),
    catalogDb().product.findMany({
      where,
      include: productInclude,
      orderBy: { name: 'asc' },
      skip,
      take: input.limit,
    }),
  ]);
  return {
    page: input.page,
    limit: input.limit,
    total,
    products: rows.map((row) => serializeProduct(row, country.code)),
  };
}

export async function getProduct(idOrSlug: string, countryCode?: string | null) {
  const row = await catalogDb().product.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: productInclude,
  });
  if (!row) throw new CatalogError(404, 'Produit inexistant.');
  const requested = parseCountryCode(countryCode);
  const categoryCountry = await catalogDb().country.findUnique({ where: { id: row.category.countryId } });
  const code = requested || categoryCountry?.code;
  if (!code) throw new CatalogError(404, 'Pays du produit introuvable.');
  return serializeProduct(row, code);
}

export async function searchProducts(input: {
  q: string;
  country: string;
  category?: string | null;
  page: number;
  limit: number;
}) {
  return listProducts({
    country: input.country,
    category: input.category,
    search: input.q,
    page: input.page,
    limit: input.limit,
  });
}

export async function listProductPharmacies(input: {
  productKey: string;
  country?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number | null;
  delivery?: boolean;
  pickup?: boolean;
  page: number;
  limit: number;
}) {
  const product = await catalogDb().product.findFirst({
    where: { OR: [{ id: input.productKey }, { slug: input.productKey }], active: true },
    include: productInclude,
  });
  if (!product) throw new CatalogError(404, 'Produit introuvable.');
  const country = input.country ? await requireCountry(input.country) : await catalogDb().country.findUniqueOrThrow({ where: { id: product.category.countryId } });

  const where: Prisma.PharmacyProductWhereInput = {
    productId: product.id,
    pharmacy: {
      active: true,
      countryId: country.id,
      ...(input.city ? { city: { equals: input.city, mode: 'insensitive' } } : {}),
    },
    ...(input.delivery ? { deliveryAvailable: true } : {}),
    ...(input.pickup ? { pickupAvailable: true } : {}),
  };

  const offers = await catalogDb().pharmacyProduct.findMany({
    where,
    include: { pharmacy: true },
  });

  const origin =
    input.latitude != null && input.longitude != null
      ? { latitude: input.latitude, longitude: input.longitude }
      : null;

  const mapped = offers
    .map((offer) => {
      const lat = offer.pharmacy.latitude;
      const lng = offer.pharmacy.longitude;
      const distanceKm =
        origin && lat != null && lng != null ? kmBetween(origin, { latitude: lat, longitude: lng }) : null;
      return {
        pharmacy: {
          id: offer.pharmacy.id,
          accountId: offer.pharmacy.accountId,
          name: offer.pharmacy.name,
          city: offer.pharmacy.city,
          latitude: lat,
          longitude: lng,
          verified: offer.pharmacy.verified,
        },
        price: Number(offer.price),
        currency: offer.currency,
        stockQuantity: offer.stockQuantity,
        available: offer.available && offer.stockQuantity > 0,
        deliveryAvailable: offer.deliveryAvailable,
        pickupAvailable: offer.pickupAvailable,
        distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
      };
    })
    .filter((offer) => (input.radiusKm == null || offer.distanceKm == null ? true : offer.distanceKm <= input.radiusKm))
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.distanceKm != null && b.distanceKm != null && a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
      return a.price - b.price;
    });

  const skip = (input.page - 1) * input.limit;
  return {
    product: serializeProduct(product, country.code),
    total: mapped.length,
    page: input.page,
    limit: input.limit,
    offers: mapped.slice(skip, skip + input.limit),
  };
}

export async function addPharmacyOffer(pharmacyId: string, input: OfferInput) {
  const db = catalogDb();
  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
  if (!pharmacy || !pharmacy.active) throw new CatalogError(404, 'Pharmacie introuvable.');
  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: { category: true },
  });
  if (!product) throw new CatalogError(404, 'Produit introuvable.');
  if (!product.active) throw new CatalogError(400, 'Ce produit n’est plus actif dans le catalogue.');
  const countryStatus = await db.productCountry.findUnique({
    where: { productId_countryId: { productId: product.id, countryId: pharmacy.countryId } },
  });
  if (!countryStatus || !countryStatus.active) {
    throw new CatalogError(400, 'Ce produit n’est pas disponible pour le pays de la pharmacie.');
  }
  const existing = await db.pharmacyProduct.findUnique({
    where: { pharmacyId_productId: { pharmacyId, productId: product.id } },
  });
  if (existing) throw new CatalogError(409, 'Ce produit est déjà dans l’offre de la pharmacie.');
  return db.pharmacyProduct.create({
    data: {
      pharmacyId,
      productId: product.id,
      price: input.price,
      currency: (await db.country.findUniqueOrThrow({ where: { id: pharmacy.countryId } })).currency,
      stockQuantity: input.stockQuantity,
      available: input.available,
      deliveryAvailable: input.deliveryAvailable,
      pickupAvailable: input.pickupAvailable,
      internalReference: input.internalReference,
      lastStockUpdate: new Date(),
    },
  });
}

export async function patchPharmacyOffer(
  pharmacyId: string,
  productId: string,
  patch: {
    price?: number;
    stockQuantity?: number;
    available?: boolean;
    deliveryAvailable?: boolean;
    pickupAvailable?: boolean;
    internalReference?: string | null;
  },
) {
  const db = catalogDb();
  const offer = await db.pharmacyProduct.findFirst({
    where: { pharmacyId, OR: [{ productId }, { product: { slug: productId } }] },
  });
  if (!offer) throw new CatalogError(404, 'Offre introuvable.');
  return db.pharmacyProduct.update({
    where: { id: offer.id },
    data: {
      ...patch,
      lastStockUpdate: patch.stockQuantity != null || patch.available != null ? new Date() : undefined,
    },
  });
}

export async function deletePharmacyOffer(pharmacyId: string, productId: string) {
  const db = catalogDb();
  const offer = await db.pharmacyProduct.findFirst({
    where: { pharmacyId, OR: [{ productId }, { product: { slug: productId } }] },
  });
  if (!offer) throw new CatalogError(404, 'Offre introuvable.');
  await db.pharmacyProduct.delete({ where: { id: offer.id } });
}

export async function adminCreateCategory(input: {
  countryId: string;
  name: string;
  slug?: string;
  description?: string | null;
  active?: boolean;
  sortOrder?: number;
}) {
  const db = catalogDb();
  const country = await db.country.findUnique({ where: { id: input.countryId } });
  if (!country) throw new CatalogError(400, 'countryId invalide.');
  const slug = input.slug || slugify(input.name);
  return db.category.create({
    data: {
      countryId: country.id,
      name: input.name,
      slug,
      description: input.description,
      active: input.active ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });
}

export async function adminPatchCategory(id: string, data: Prisma.CategoryUpdateInput) {
  const db = catalogDb();
  const row = await db.category.findUnique({ where: { id } });
  if (!row) throw new CatalogError(404, 'Catégorie introuvable.');
  return db.category.update({ where: { id }, data });
}

export async function adminCreateProduct(input: {
  categoryId: string;
  name: string;
  slug?: string;
  genericName?: string | null;
  brandName?: string | null;
  activeIngredient?: string | null;
  dosage?: string | null;
  dosageUnit?: string | null;
  pharmaceuticalForm?: string | null;
  packaging?: string | null;
  description?: string | null;
  requiresPrescription?: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
  active?: boolean;
}) {
  const db = catalogDb();
  const category = await db.category.findUnique({ where: { id: input.categoryId } });
  if (!category) throw new CatalogError(400, 'categoryId invalide.');
  const slug = input.slug || slugify(`${input.name}-${input.dosage || ''}-${input.pharmaceuticalForm || ''}`);
  const product = await db.product.create({
    data: {
      categoryId: category.id,
      name: input.name,
      slug,
      genericName: input.genericName,
      brandName: input.brandName,
      activeIngredient: input.activeIngredient,
      dosage: input.dosage,
      dosageUnit: input.dosageUnit,
      pharmaceuticalForm: input.pharmaceuticalForm,
      packaging: input.packaging,
      description: input.description,
      requiresPrescription: input.requiresPrescription ?? false,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt || input.name,
      active: input.active ?? true,
    },
  });
  await db.productCountry.create({
    data: {
      productId: product.id,
      countryId: category.countryId,
      status: 'PENDING_REVIEW',
      requiresPrescription: input.requiresPrescription ?? false,
      verified: false,
      active: true,
      regulatoryNote: 'Statut réglementaire : à vérifier. La création n’autorise pas le produit.',
    },
  });
  return db.product.findUniqueOrThrow({ where: { id: product.id }, include: productInclude });
}

export async function createCatalogProduct(input: {
  name: string;
  categoryId: string;
  countryCode: string;
  genericName?: string | null;
  brandName?: string | null;
  description?: string | null;
  dosage?: string | null;
  pharmaceuticalForm?: string | null;
  requiresPrescription?: boolean;
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  const db = catalogDb();
  const country = await requireCountry(input.countryCode);
  const category = await db.category.findUnique({ where: { id: input.categoryId } });
  if (!category || !category.active) throw new CatalogError(400, 'Catégorie inexistante.');
  if (category.countryId !== country.id) {
    throw new CatalogError(400, 'Cette catégorie n’appartient pas au pays sélectionné.');
  }
  const existingInCountry = await db.product.findFirst({
    where: {
      name: { equals: input.name, mode: 'insensitive' },
      countryStatuses: { some: { countryId: country.id } },
    },
  });
  if (existingInCountry) throw new CatalogError(409, 'Ce produit existe déjà pour ce pays.');

  const existingGlobal = await db.product.findFirst({
    where: { name: { equals: input.name, mode: 'insensitive' } },
    include: productInclude,
  });
  if (existingGlobal) {
    await db.productCountry.create({
      data: {
        productId: existingGlobal.id,
        countryId: country.id,
        status: 'PENDING_REVIEW',
        requiresPrescription: input.requiresPrescription ?? existingGlobal.requiresPrescription,
        verified: false,
        active: true,
        regulatoryNote: 'Statut réglementaire : à vérifier. La création n’autorise pas le produit.',
      },
    });
    if (input.imageUrl) {
      await db.product.update({
        where: { id: existingGlobal.id },
        data: { imageUrl: input.imageUrl, imageAlt: input.imageAlt || existingGlobal.name },
      });
    }
    return db.product.findUniqueOrThrow({ where: { id: existingGlobal.id }, include: productInclude });
  }

  const slug = slugify(`${input.name}-${input.dosage || ''}-${input.pharmaceuticalForm || ''}-${country.code}`);
  return adminCreateProduct({
    categoryId: category.id,
    name: input.name,
    slug,
    genericName: input.genericName,
    brandName: input.brandName,
    description: input.description,
    dosage: input.dosage,
    pharmaceuticalForm: input.pharmaceuticalForm,
    requiresPrescription: input.requiresPrescription,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt || input.name,
  });
}

export async function updateCatalogProduct(
  id: string,
  input: {
    name?: string;
    genericName?: string | null;
    brandName?: string | null;
    description?: string | null;
    dosage?: string | null;
    pharmaceuticalForm?: string | null;
    categoryId?: string;
    requiresPrescription?: boolean;
    active?: boolean;
    countryCode?: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
  },
) {
  const db = catalogDb();
  const row = await db.product.findUnique({ where: { id }, include: { category: true } });
  if (!row) throw new CatalogError(404, 'Produit inexistant.');
  if (input.categoryId) {
    const category = await db.category.findUnique({ where: { id: input.categoryId } });
    if (!category) throw new CatalogError(400, 'Catégorie inexistante.');
  }
  const product = await db.product.update({
    where: { id },
    data: {
      ...(input.name != null ? { name: input.name } : {}),
      ...(input.genericName !== undefined ? { genericName: input.genericName } : {}),
      ...(input.brandName !== undefined ? { brandName: input.brandName } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
      ...(input.pharmaceuticalForm !== undefined ? { pharmaceuticalForm: input.pharmaceuticalForm } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.requiresPrescription !== undefined ? { requiresPrescription: input.requiresPrescription } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.imageAlt !== undefined ? { imageAlt: input.imageAlt } : {}),
    },
    include: productInclude,
  });
  const country = input.countryCode ? await requireCountry(input.countryCode) : null;
  if (country && input.requiresPrescription !== undefined) {
    await db.productCountry.updateMany({
      where: { productId: id, countryId: country.id },
      data: { requiresPrescription: input.requiresPrescription },
    });
  }
  return product;
}

export async function deactivateCatalogProduct(id: string) {
  return updateCatalogProduct(id, { active: false });
}

export async function adminPatchProduct(id: string, data: Prisma.ProductUpdateInput) {
  const db = catalogDb();
  const row = await db.product.findUnique({ where: { id } });
  if (!row) throw new CatalogError(404, 'Produit introuvable.');
  return db.product.update({ where: { id }, data });
}

export async function adminUpsertProductCountry(input: {
  productId: string;
  countryId: string;
  status?: string;
  requiresPrescription?: boolean | null;
  regulatoryReference?: string | null;
  regulatoryNote?: string | null;
  verified?: boolean;
}) {
  const db = catalogDb();
  const product = await db.product.findUnique({ where: { id: input.productId } });
  if (!product) throw new CatalogError(404, 'Produit introuvable.');
  const country = await db.country.findUnique({ where: { id: input.countryId } });
  if (!country) throw new CatalogError(400, 'countryId invalide.');
  const status = (input.status || 'PENDING_REVIEW') as
    | 'PENDING'
    | 'PENDING_REVIEW'
    | 'ACTIVE'
    | 'RESTRICTED'
    | 'INACTIVE'
    | 'UNKNOWN';
  const verified = Boolean(input.verified);
  return db.productCountry.upsert({
    where: { productId_countryId: { productId: product.id, countryId: country.id } },
    create: {
      productId: product.id,
      countryId: country.id,
      status,
      requiresPrescription: input.requiresPrescription ?? product.requiresPrescription,
      regulatoryReference: input.regulatoryReference,
      regulatoryNote: input.regulatoryNote,
      verified,
      verifiedAt: verified ? new Date() : null,
    },
    update: {
      status,
      requiresPrescription: input.requiresPrescription,
      regulatoryReference: input.regulatoryReference,
      regulatoryNote: input.regulatoryNote,
      verified,
      verifiedAt: verified ? new Date() : null,
    },
  });
}

export async function adminListCatalog() {
  const db = catalogDb();
  const [countries, categories, products] = await Promise.all([
    db.country.findMany({ orderBy: { name: 'asc' } }),
    db.category.findMany({ include: { country: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
    db.product.findMany({
      include: { category: { include: { country: true } }, countryStatuses: { include: { country: true } } },
      orderBy: { name: 'asc' },
      take: 200,
    }),
  ]);
  return { countries, categories, products };
}
