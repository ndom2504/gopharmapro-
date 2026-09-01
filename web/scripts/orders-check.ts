import { catalogDb } from '../lib/prisma';
import { upsertClientProfile } from '../lib/client/auth';
import {
  addCartItem,
  assertOfferForCart,
  clearCart,
  removeCartItem,
  serializeCart,
  updateCartItem,
} from '../lib/orders/cart';
import { createOrdersFromCart } from '../lib/orders/checkout';
import { cancelCustomerOrder, getCustomerOrder, getPharmacyOrder } from '../lib/orders/access';
import { reviewOrderPrescription } from '../lib/orders/prescription';
import { blobConfigured, validatePrescriptionFile } from '../lib/catalog/blob';
import { CatalogError } from '../lib/catalog/validations';

function ok(name: string) {
  console.log('ok  ' + name);
}

function fail(name: string, err: unknown) {
  console.error('fail  ' + name + ' — ' + (err instanceof Error ? err.message : err));
  process.exitCode = 1;
}

async function expectStatus(name: string, fn: () => Promise<unknown>, status: number) {
  try {
    await fn();
    fail(name, 'aucune erreur');
  } catch (err) {
    if (err instanceof CatalogError && err.status === status) ok(name);
    else fail(name, err);
  }
}

async function main() {
  const db = catalogDb();
  const customer = await upsertClientProfile({
    accountId: 'c-order-check',
    country: 'GA',
    city: 'Libreville',
    address: 'Test commandes',
  });
  const other = await upsertClientProfile({ accountId: 'c-order-other', country: 'GA' });
  const para = await db.pharmacyProduct.findFirst({
    where: { pharmacy: { accountId: 'ph-centre' }, product: { slug: 'paracetamol-500-mg-comprime' } },
    include: { product: true, pharmacy: true },
  });
  const amox = await db.pharmacyProduct.findFirst({
    where: { pharmacy: { accountId: 'ph-centre' }, product: { slug: 'amoxicilline-500-mg-gelule' } },
    include: { product: true, pharmacy: true },
  });
  const ibu = await db.product.findUnique({ where: { slug: 'ibuprofene-400-mg-comprime' } });
  if (!para || !amox || !ibu) throw new Error('offres démo manquantes — lancez le seed');

  const gabon = await db.country.findUnique({ where: { code: 'GA' } });
  if (!gabon) throw new Error('pays GA manquant');

  let tempPharmacyId = '';
  let tempOfferId = '';
  const createdOrderIds: string[] = [];

  const leftoverPharmacy = await db.pharmacy.findUnique({ where: { accountId: 'ph-order-check' } });
  if (leftoverPharmacy) {
    await db.order.deleteMany({ where: { pharmacyId: leftoverPharmacy.id } });
    await db.pharmacyProduct.deleteMany({ where: { pharmacyId: leftoverPharmacy.id } });
    await db.pharmacy.delete({ where: { id: leftoverPharmacy.id } });
  }
  await db.order.deleteMany({ where: { customer: { accountId: { in: ['c-order-check', 'c-order-other'] } } } });
  await db.cart.deleteMany({ where: { customer: { accountId: { in: ['c-order-check', 'c-order-other'] } } } });

  try {
    await clearCart(customer.id);

    const added = await addCartItem(customer.id, para.id, 2);
    if (!added.items.some((i) => i.pharmacyProductId === para.id && i.quantity === 2)) throw new Error('ajout');
    ok('ajouter un produit au panier');

    const updated = await updateCartItem(customer.id, added.items[0].id, 3);
    if (updated.items[0].quantity !== 3) throw new Error('qty');
    ok('modifier quantité');

    const afterDel = await removeCartItem(customer.id, updated.items[0].id);
    if (afterDel.items.length) throw new Error('delete');
    ok('supprimer produit');

    const empty = await serializeCart(customer.id);
    if (empty.items.length) throw new Error('not empty');
    ok('panier vide');

    await expectStatus('stock insuffisant', () => addCartItem(customer.id, para.id, para.stockQuantity + 5), 400);
    await expectStatus('fichier non-image/pdf', async () => {
      validatePrescriptionFile(new File(['x'], 'x.txt', { type: 'text/plain' }));
    }, 400);

    const prevAvail = para.available;
    await db.pharmacyProduct.update({ where: { id: para.id }, data: { available: false } });
    await expectStatus('produit indisponible', () => addCartItem(customer.id, para.id, 1), 400);
    await db.pharmacyProduct.update({ where: { id: para.id }, data: { available: prevAvail } });

    const prevActive = para.pharmacy.active;
    await db.pharmacy.update({ where: { id: para.pharmacyId }, data: { active: false } });
    await expectStatus('pharmacie inactive', () => addCartItem(customer.id, para.id, 1), 400);
    await db.pharmacy.update({ where: { id: para.pharmacyId }, data: { active: prevActive } });

    await addCartItem(customer.id, amox.id, 1);
    const rxCart = await serializeCart(customer.id);
    if (!rxCart.items[0].prescriptionRequired) throw new Error('rx flag');
    ok('produit sur ordonnance dans le panier');

    const rxOrders = await createOrdersFromCart(customer, { fulfillmentMethod: 'PICKUP' });
    createdOrderIds.push(...rxOrders.map((o) => o.id));
    if (rxOrders.length !== 1 || rxOrders[0].status !== 'PENDING_PRESCRIPTION') throw new Error(rxOrders[0]?.status);
    if (!/^GP-\d{4}-\d{6}$/.test(rxOrders[0].orderNumber)) throw new Error(rxOrders[0].orderNumber);
    ok('commande avec ordonnance + numéro GP-XXXX-XXXXXX');

    if (!blobConfigured()) {
      await expectStatus(
        'upload ordonnance sans blob',
        () =>
          import('../lib/orders/prescription').then((m) =>
            m.attachOrderPrescription(customer.id, rxOrders[0].id, new File([Buffer.alloc(10)], 'rx.jpg', { type: 'image/jpeg' })),
          ),
        503,
      );
    } else {
      ok('upload ordonnance (blob configuré — 503 non testé)');
    }

    await db.orderPrescription.update({
      where: { orderId: rxOrders[0].id },
      data: { documentUrl: 'https://example.invalid/rx.jpg', status: 'SUBMITTED' },
    });
    await db.order.update({ where: { id: rxOrders[0].id }, data: { status: 'PRESCRIPTION_REVIEW' } });
    const approved = await reviewOrderPrescription(para.pharmacyId, rxOrders[0].id, 'approve', null, 'ph-centre');
    if (approved.status !== 'READY_FOR_PAYMENT' || approved.prescription?.status !== 'APPROVED') throw new Error('approve');
    ok('validation ordonnance');

    await addCartItem(customer.id, amox.id, 1);
    const rejectOrders = await createOrdersFromCart(customer, { fulfillmentMethod: 'PICKUP' });
    createdOrderIds.push(...rejectOrders.map((o) => o.id));
    await db.orderPrescription.update({
      where: { orderId: rejectOrders[0].id },
      data: { documentUrl: 'https://example.invalid/rx.jpg', status: 'SUBMITTED' },
    });
    await db.order.update({ where: { id: rejectOrders[0].id }, data: { status: 'PRESCRIPTION_REVIEW' } });
    const rejected = await reviewOrderPrescription(para.pharmacyId, rejectOrders[0].id, 'reject', 'Ordonnance illisible', 'ph-centre');
    if (rejected.status !== 'REJECTED') throw new Error('reject');
    ok('refus ordonnance');

    const originalPrice = Number(para.price);
    await db.pharmacyProduct.update({ where: { id: para.id }, data: { price: originalPrice + 250 } });
    await addCartItem(customer.id, para.id, 2);
    const priced = await createOrdersFromCart(customer, { fulfillmentMethod: 'PICKUP' });
    createdOrderIds.push(...priced.map((o) => o.id));
    await db.pharmacyProduct.update({ where: { id: para.id }, data: { price: originalPrice } });
    if (priced[0].items[0].unitPrice !== originalPrice + 250) throw new Error(String(priced[0].items[0].unitPrice));
    if (priced[0].status !== 'READY_FOR_PAYMENT') throw new Error(priced[0].status);
    ok('commande sans ordonnance + recalcul serveur des prix');

    const temp = await db.pharmacy.create({
      data: {
        accountId: 'ph-order-check',
        name: 'Pharmacie Test Commandes',
        email: 'order-check@pharma.ga',
        city: 'Libreville',
        countryId: gabon.id,
        active: true,
        verified: true,
      },
    });
    tempPharmacyId = temp.id;
    const tempOffer = await db.pharmacyProduct.create({
      data: {
        pharmacyId: temp.id,
        productId: ibu.id,
        price: 2000,
        currency: 'XAF',
        stockQuantity: 5,
        available: true,
        pickupAvailable: true,
        deliveryAvailable: false,
      },
    });
    tempOfferId = tempOffer.id;
    await addCartItem(customer.id, para.id, 1);
    await addCartItem(customer.id, tempOffer.id, 1);
    const multiCart = await serializeCart(customer.id);
    if (multiCart.groups.length !== 2) throw new Error('groups ' + multiCart.groups.length);
    ok('panier contenant plusieurs pharmacies');
    const multi = await createOrdersFromCart(customer, { fulfillmentMethod: 'PICKUP' });
    createdOrderIds.push(...multi.map((o) => o.id));
    if (multi.length !== 2) throw new Error('orders ' + multi.length);
    ok('création d’une commande par pharmacie');

    await expectStatus('protection commande autre client', () => getCustomerOrder(other.id, priced[0].id), 404);
    await expectStatus('protection commande autre pharmacie', () => getPharmacyOrder(temp.id, priced[0].id), 404);
    ok('protection des commandes');

    const cancelled = await cancelCustomerOrder(customer.id, priced[0].id);
    if (cancelled.status !== 'CANCELLED') throw new Error(cancelled.status);
    ok('annulation');

    await assertOfferForCart(para.id, 1);
    ok('offre valide après tests');
  } catch (err) {
    fail('suite commandes', err);
  } finally {
    await clearCart(customer.id);
    if (createdOrderIds.length) {
      await db.order.deleteMany({ where: { id: { in: createdOrderIds } } });
    }
    if (tempOfferId) await db.pharmacyProduct.deleteMany({ where: { id: tempOfferId } });
    if (tempPharmacyId) await db.pharmacy.deleteMany({ where: { id: tempPharmacyId } });
    await db.cart.deleteMany({ where: { customerId: { in: [customer.id, other.id] } } });
    await db.customerProfile.deleteMany({ where: { accountId: { in: ['c-order-check', 'c-order-other'] } } });
  }
}

main()
  .then(() => {
    if (!process.exitCode) console.log('orders-check ok');
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
