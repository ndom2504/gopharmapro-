import { catalogDb } from '@/lib/prisma';
import { CatalogError } from '@/lib/catalog/validations';
import { configuredDeliveryFee, lineTotal, money } from './money';

const offerInclude = {
  pharmacy: { include: { country: true } },
  product: { include: { countryStatuses: true } },
} as const;

export function requiresPrescriptionForOffer(offer: {
  pharmacy: { countryId: string };
  product: {
    requiresPrescription: boolean;
    countryStatuses: { countryId: string; requiresPrescription: boolean | null }[];
  };
}) {
  const pc = offer.product.countryStatuses.find((s) => s.countryId === offer.pharmacy.countryId);
  return pc?.requiresPrescription ?? offer.product.requiresPrescription;
}

export async function assertOfferForCart(pharmacyProductId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new CatalogError(400, 'Quantité invalide.');
  }
  const offer = await catalogDb().pharmacyProduct.findUnique({
    where: { id: pharmacyProductId },
    include: offerInclude,
  });
  if (!offer) throw new CatalogError(404, 'Offre introuvable.');
  if (!offer.pharmacy.active) throw new CatalogError(400, 'Cette pharmacie n’est plus active.');
  if (!offer.pharmacy.verified) throw new CatalogError(400, 'Cette pharmacie n’est pas encore vérifiée.');
  if (!offer.product.active) throw new CatalogError(400, 'Ce produit n’est plus actif.');
  if (!offer.available) throw new CatalogError(400, 'Ce produit n’est plus disponible.');
  const pc = offer.product.countryStatuses.find((s) => s.countryId === offer.pharmacy.countryId);
  if (!pc || !pc.active) throw new CatalogError(400, 'Ce produit n’est pas proposé dans ce pays.');
  if (quantity > offer.stockQuantity) {
    throw new CatalogError(400, 'Quantité disponible insuffisante.');
  }
  return offer;
}

export async function getOrCreateCart(customerId: string) {
  const db = catalogDb();
  const existing = await db.cart.findUnique({ where: { customerId } });
  if (existing) return existing;
  return db.cart.create({ data: { customerId } });
}

export async function getCartWithItems(customerId: string) {
  const cart = await getOrCreateCart(customerId);
  return catalogDb().cart.findUniqueOrThrow({
    where: { id: cart.id },
    include: {
      items: {
        include: { pharmacyProduct: { include: offerInclude } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

function serializeCartItem(item: {
  id: string;
  quantity: number;
  pharmacyProduct: {
    id: string;
    price: { toString(): string } | number;
    currency: string;
    stockQuantity: number;
    available: boolean;
    deliveryAvailable: boolean;
    pickupAvailable: boolean;
    pharmacy: { id: string; name: string; city: string | null; address: string | null };
    product: {
      id: string;
      name: string;
      genericName: string | null;
      dosage: string | null;
      pharmaceuticalForm: string | null;
      imageUrl: string | null;
      imageAlt: string | null;
      requiresPrescription: boolean;
      countryStatuses: { countryId: string; requiresPrescription: boolean | null }[];
    };
  };
}) {
  const offer = item.pharmacyProduct;
  const unitPrice = money(Number(offer.price));
  const rx = requiresPrescriptionForOffer(offer);
  return {
    id: item.id,
    pharmacyProductId: offer.id,
    quantity: item.quantity,
    unitPrice,
    lineTotal: lineTotal(unitPrice, item.quantity),
    currency: offer.currency,
    stockQuantity: offer.stockQuantity,
    available: offer.available,
    deliveryAvailable: offer.deliveryAvailable,
    pickupAvailable: offer.pickupAvailable,
    prescriptionRequired: rx,
    product: {
      id: offer.product.id,
      name: offer.product.name,
      genericName: offer.product.genericName,
      dosage: offer.product.dosage,
      pharmaceuticalForm: offer.product.pharmaceuticalForm,
      imageUrl: offer.product.imageUrl,
      imageAlt: offer.product.imageAlt || offer.product.name,
    },
    pharmacy: offer.pharmacy,
  };
}

export async function serializeCart(customerId: string) {
  const cart = await getCartWithItems(customerId);
  const items = cart.items.map(serializeCartItem);
  const groupsMap = new Map<
    string,
    {
      pharmacy: { id: string; name: string; city: string | null; address: string | null };
      items: ReturnType<typeof serializeCartItem>[];
      subtotal: number;
      hasPrescription: boolean;
      deliveryAvailable: boolean;
      pickupAvailable: boolean;
    }
  >();
  for (const item of items) {
    const current = groupsMap.get(item.pharmacy.id) || {
      pharmacy: item.pharmacy,
      items: [],
      subtotal: 0,
      hasPrescription: false,
      deliveryAvailable: true,
      pickupAvailable: true,
    };
    current.items.push(item);
    current.subtotal = money(current.subtotal + item.lineTotal);
    current.hasPrescription = current.hasPrescription || item.prescriptionRequired;
    current.deliveryAvailable = current.deliveryAvailable && item.deliveryAvailable;
    current.pickupAvailable = current.pickupAvailable && item.pickupAvailable;
    groupsMap.set(item.pharmacy.id, current);
  }
  const groups = [...groupsMap.values()];
  return {
    id: cart.id,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: money(items.reduce((sum, item) => sum + item.lineTotal, 0)),
    deliveryFee: configuredDeliveryFee(),
    currency: items[0]?.currency || 'XAF',
    groups,
    items,
  };
}

export async function addCartItem(customerId: string, pharmacyProductId: string, quantity: number) {
  const cart = await getOrCreateCart(customerId);
  const existing = await catalogDb().cartItem.findUnique({
    where: { cartId_pharmacyProductId: { cartId: cart.id, pharmacyProductId } },
  });
  const nextQty = (existing?.quantity || 0) + quantity;
  await assertOfferForCart(pharmacyProductId, nextQty);
  if (existing) {
    await catalogDb().cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQty },
    });
  } else {
    await catalogDb().cartItem.create({
      data: { cartId: cart.id, pharmacyProductId, quantity },
    });
  }
  return serializeCart(customerId);
}

export async function updateCartItem(customerId: string, itemId: string, quantity: number) {
  const item = await catalogDb().cartItem.findFirst({
    where: { id: itemId, cart: { customerId } },
  });
  if (!item) throw new CatalogError(404, 'Article introuvable.');
  if (quantity < 1) {
    await catalogDb().cartItem.delete({ where: { id: item.id } });
    return serializeCart(customerId);
  }
  await assertOfferForCart(item.pharmacyProductId, quantity);
  await catalogDb().cartItem.update({ where: { id: item.id }, data: { quantity } });
  return serializeCart(customerId);
}

export async function removeCartItem(customerId: string, itemId: string) {
  const item = await catalogDb().cartItem.findFirst({
    where: { id: itemId, cart: { customerId } },
  });
  if (!item) throw new CatalogError(404, 'Article introuvable.');
  await catalogDb().cartItem.delete({ where: { id: item.id } });
  return serializeCart(customerId);
}

export async function clearCart(customerId: string) {
  const cart = await getOrCreateCart(customerId);
  await catalogDb().cartItem.deleteMany({ where: { cartId: cart.id } });
  return serializeCart(customerId);
}
