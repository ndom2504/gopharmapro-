import type { Prisma } from '@prisma/client';
import { catalogDb } from '@/lib/prisma';
import { CatalogError } from '@/lib/catalog/validations';
import { canClientCancel } from './status';
import { serializeOrder } from './serialize';

const orderInclude = {
  pharmacy: true,
  customer: true,
  items: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
  prescription: true,
} satisfies Prisma.OrderInclude;

export async function listCustomerOrders(customerId: string) {
  const rows = await catalogDb().order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => serializeOrder(row, { includeDocument: true }));
}

export async function getCustomerOrder(customerId: string, orderId: string) {
  const row = await catalogDb().order.findFirst({
    where: { customerId, OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: orderInclude,
  });
  if (!row) throw new CatalogError(404, 'Commande introuvable.');
  return serializeOrder(row, { includeDocument: true });
}

export async function cancelCustomerOrder(customerId: string, orderId: string) {
  const row = await catalogDb().order.findFirst({
    where: { customerId, OR: [{ id: orderId }, { orderNumber: orderId }] },
  });
  if (!row) throw new CatalogError(404, 'Commande introuvable.');
  if (!canClientCancel(row.status)) {
    throw new CatalogError(400, 'Cette commande ne peut plus être annulée.');
  }
  const updated = await catalogDb().order.update({
    where: { id: row.id },
    data: { status: 'CANCELLED' },
    include: orderInclude,
  });
  return serializeOrder(updated, { includeDocument: true });
}

export async function listPharmacyOrders(pharmacyId: string) {
  const rows = await catalogDb().order.findMany({
    where: { pharmacyId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((row) => serializeOrder(row, { includeDocument: true, includeCustomer: true }));
}

export async function getPharmacyOrder(pharmacyId: string, orderId: string) {
  const row = await catalogDb().order.findFirst({
    where: { pharmacyId, OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: orderInclude,
  });
  if (!row) throw new CatalogError(404, 'Commande introuvable.');
  return serializeOrder(row, { includeDocument: true, includeCustomer: true });
}

export async function listAdminOrders() {
  const rows = await catalogDb().order.findMany({
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return rows.map((row) => serializeOrder(row, { includeDocument: true, includeCustomer: true }));
}
