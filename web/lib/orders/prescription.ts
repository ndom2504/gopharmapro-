import { catalogDb } from '@/lib/prisma';
import { CatalogError } from '@/lib/catalog/validations';
import { uploadOrderPrescription } from '@/lib/catalog/blob';
import { serializeOrder } from './serialize';

const orderInclude = {
  pharmacy: true,
  customer: true,
  items: { include: { product: true }, orderBy: { createdAt: 'asc' as const } },
  prescription: true,
} as const;

export async function attachOrderPrescription(customerId: string, orderId: string, file: File) {
  const order = await catalogDb().order.findFirst({
    where: { customerId, OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: { prescription: true, items: true },
  });
  if (!order) throw new CatalogError(404, 'Commande introuvable.');
  if (order.status !== 'PENDING_PRESCRIPTION' && order.status !== 'PRESCRIPTION_REVIEW') {
    throw new CatalogError(400, 'Cette commande n’attend plus d’ordonnance.');
  }
  const uploaded = await uploadOrderPrescription(file);
  const updated = await catalogDb().order.update({
    where: { id: order.id },
    data: {
      status: 'PRESCRIPTION_REVIEW',
      prescription: order.prescription
        ? {
            update: {
              documentUrl: uploaded.url,
              status: 'SUBMITTED',
              note: null,
              reviewedAt: null,
              reviewedBy: null,
            },
          }
        : {
            create: {
              documentUrl: uploaded.url,
              status: 'SUBMITTED',
            },
          },
    },
    include: orderInclude,
  });
  return serializeOrder(updated, { includeDocument: true });
}

export async function reviewOrderPrescription(
  pharmacyId: string,
  orderId: string,
  action: 'approve' | 'reject',
  note?: string | null,
  reviewedBy?: string | null,
) {
  const order = await catalogDb().order.findFirst({
    where: { pharmacyId, OR: [{ id: orderId }, { orderNumber: orderId }] },
    include: { prescription: true },
  });
  if (!order) throw new CatalogError(404, 'Commande introuvable.');
  if (order.status !== 'PRESCRIPTION_REVIEW') {
    throw new CatalogError(400, 'Aucune ordonnance à valider pour cette commande.');
  }
  if (!order.prescription || order.prescription.status !== 'SUBMITTED') {
    throw new CatalogError(400, 'Ordonnance introuvable ou déjà traitée.');
  }
  if (action === 'reject' && !String(note || '').trim()) {
    throw new CatalogError(400, 'Une note est requise pour refuser une ordonnance.');
  }
  const updated = await catalogDb().order.update({
    where: { id: order.id },
    data: {
      status: action === 'approve' ? 'READY_FOR_PAYMENT' : 'REJECTED',
      prescription: {
        update: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          note: String(note || '').trim() || null,
          reviewedAt: new Date(),
          reviewedBy: reviewedBy || pharmacyId,
        },
      },
    },
    include: orderInclude,
  });
  return serializeOrder(updated, { includeDocument: true, includeCustomer: true });
}
