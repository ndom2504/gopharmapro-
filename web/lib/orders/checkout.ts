import type { FulfillmentMethod, Prisma } from '@prisma/client';
import { catalogDb } from '@/lib/prisma';
import { CatalogError } from '@/lib/catalog/validations';
import { assertOfferForCart, getCartWithItems, requiresPrescriptionForOffer } from './cart';
import { configuredDeliveryFee, lineTotal, money } from './money';
import { nextOrderNumber } from './orderNumber';
import { parseFulfillment } from './status';
import { serializeOrder } from './serialize';

const orderInclude = {
  pharmacy: true,
  customer: true,
  items: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
  prescription: true,
} satisfies Prisma.OrderInclude;

export type CheckoutInput = {
  fulfillmentByPharmacy?: Record<string, unknown>;
  fulfillmentMethod?: unknown;
  deliveryAddress?: string | null;
  deliveryCity?: string | null;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  deliveryPhone?: string | null;
  notes?: string | null;
  useSavedAddress?: boolean;
};

export async function createOrdersFromCart(
  customer: {
    id: string;
    city: string | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
  },
  input: CheckoutInput,
) {
  const cart = await getCartWithItems(customer.id);
  if (!cart.items.length) throw new CatalogError(400, 'Votre panier est vide.');

  const groups = new Map<string, typeof cart.items>();
  for (const item of cart.items) {
    const list = groups.get(item.pharmacyProduct.pharmacyId) || [];
    list.push(item);
    groups.set(item.pharmacyProduct.pharmacyId, list);
  }

  const defaultFulfillment = parseFulfillment(input.fulfillmentMethod) || 'PICKUP';
  const address = String(input.deliveryAddress || (input.useSavedAddress ? customer.address : '') || '').trim();
  const city = String(input.deliveryCity || (input.useSavedAddress ? customer.city : '') || '').trim();
  const phone = String(input.deliveryPhone || '').trim();
  const notes = String(input.notes || '').trim() || null;

  const createdIds: string[] = [];
  const db = catalogDb();

  try {
    for (const [pharmacyId, items] of groups) {
      const method =
        parseFulfillment(input.fulfillmentByPharmacy?.[pharmacyId]) || defaultFulfillment;
      const priced = [];
      for (const item of items) {
        const offer = await assertOfferForCart(item.pharmacyProductId, item.quantity);
        if (method === 'DELIVERY' && !offer.deliveryAvailable) {
          throw new CatalogError(400, `Livraison indisponible chez ${offer.pharmacy.name}.`);
        }
        if (method === 'PICKUP' && !offer.pickupAvailable) {
          throw new CatalogError(400, `Retrait indisponible chez ${offer.pharmacy.name}.`);
        }
        const unitPrice = money(Number(offer.price));
        priced.push({
          offer,
          quantity: item.quantity,
          unitPrice,
          totalPrice: lineTotal(unitPrice, item.quantity),
          prescriptionRequired: requiresPrescriptionForOffer(offer),
        });
      }
      if (method === 'DELIVERY' && (!address || !city)) {
        throw new CatalogError(400, 'Adresse et ville sont requises pour la livraison.');
      }
      const subtotal = money(priced.reduce((sum, row) => sum + row.totalPrice, 0));
      const deliveryFee = method === 'DELIVERY' ? configuredDeliveryFee() : 0;
      const needsRx = priced.some((row) => row.prescriptionRequired);
      const status = needsRx ? 'PENDING_PRESCRIPTION' : 'READY_FOR_PAYMENT';
      const currency = priced[0]?.offer.currency || 'XAF';

      let order = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          order = await db.order.create({
            data: {
              orderNumber: await nextOrderNumber(),
              customerId: customer.id,
              pharmacyId,
              status,
              fulfillmentMethod: method as FulfillmentMethod,
              subtotal,
              deliveryFee,
              total: money(subtotal + deliveryFee),
              currency,
              deliveryAddress: method === 'DELIVERY' ? address : null,
              deliveryCity: method === 'DELIVERY' ? city : null,
              deliveryLatitude: method === 'DELIVERY' ? input.deliveryLatitude ?? customer.latitude : null,
              deliveryLongitude: method === 'DELIVERY' ? input.deliveryLongitude ?? customer.longitude : null,
              deliveryPhone: phone || null,
              notes,
              items: {
                create: priced.map((row) => ({
                  productId: row.offer.productId,
                  pharmacyProductId: row.offer.id,
                  productName: row.offer.product.name,
                  productGenericName: row.offer.product.genericName,
                  dosage: row.offer.product.dosage,
                  pharmaceuticalForm: row.offer.product.pharmaceuticalForm,
                  quantity: row.quantity,
                  unitPrice: row.unitPrice,
                  totalPrice: row.totalPrice,
                  prescriptionRequired: row.prescriptionRequired,
                })),
              },
              prescription: needsRx ? { create: { status: 'PENDING' } } : undefined,
            },
            include: orderInclude,
          });
          break;
        } catch (err) {
          const message = err instanceof Error ? err.message : '';
          if (!message.includes('Unique constraint') || attempt === 4) throw err;
        }
      }
      if (!order) throw new CatalogError(500, 'Impossible de créer la commande.');
      createdIds.push(order.id);
    }

    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  } catch (err) {
    if (createdIds.length) {
      await db.order.deleteMany({ where: { id: { in: createdIds } } });
    }
    throw err;
  }

  const orders = await db.order.findMany({
    where: { id: { in: createdIds } },
    include: orderInclude,
    orderBy: { createdAt: 'asc' },
  });
  return orders.map((row) => serializeOrder(row, { includeDocument: true, includeCustomer: false }));
}
