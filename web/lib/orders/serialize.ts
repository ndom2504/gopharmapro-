import type { FulfillmentMethod, OrderPrescriptionStatus, OrderStatus } from '@prisma/client';
import { fulfillmentLabel, orderPrescriptionLabel, orderStatusLabel } from './status';

type OrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  fulfillmentMethod: FulfillmentMethod;
  subtotal: { toString(): string } | number;
  deliveryFee: { toString(): string } | number;
  total: { toString(): string } | number;
  currency: string;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryLatitude: number | null;
  deliveryLongitude: number | null;
  deliveryPhone: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  pharmacy: { id: string; name: string; city: string | null; address: string | null; phone: string | null };
  customer?: { id: string; accountId: string; city: string | null; address: string | null };
  items: {
    id: string;
    productId: string;
    productName: string;
    productGenericName: string | null;
    dosage: string | null;
    pharmaceuticalForm: string | null;
    quantity: number;
    unitPrice: { toString(): string } | number;
    totalPrice: { toString(): string } | number;
    prescriptionRequired: boolean;
    product?: { imageUrl: string | null; imageAlt: string | null };
  }[];
  prescription: {
    id: string;
    documentUrl: string | null;
    status: OrderPrescriptionStatus;
    note: string | null;
    reviewedAt: Date | null;
  } | null;
};

function money(value: { toString(): string } | number) {
  return Number(value);
}

export function serializeOrder(row: OrderRow, opts: { includeDocument?: boolean; includeCustomer?: boolean } = {}) {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    statusLabel: orderStatusLabel[row.status],
    fulfillmentMethod: row.fulfillmentMethod,
    fulfillmentLabel: fulfillmentLabel[row.fulfillmentMethod],
    subtotal: money(row.subtotal),
    deliveryFee: money(row.deliveryFee),
    total: money(row.total),
    currency: row.currency,
    deliveryAddress: row.deliveryAddress,
    deliveryCity: row.deliveryCity,
    deliveryLatitude: row.deliveryLatitude,
    deliveryLongitude: row.deliveryLongitude,
    deliveryPhone: row.deliveryPhone,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    pharmacy: row.pharmacy,
    customer: opts.includeCustomer ? row.customer : undefined,
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productGenericName: item.productGenericName,
      dosage: item.dosage,
      pharmaceuticalForm: item.pharmaceuticalForm,
      quantity: item.quantity,
      unitPrice: money(item.unitPrice),
      totalPrice: money(item.totalPrice),
      prescriptionRequired: item.prescriptionRequired,
      imageUrl: item.product?.imageUrl ?? null,
      imageAlt: item.product?.imageAlt || item.productName,
    })),
    prescription: row.prescription
      ? {
          id: row.prescription.id,
          status: row.prescription.status,
          statusLabel: orderPrescriptionLabel[row.prescription.status],
          note: row.prescription.note,
          reviewedAt: row.prescription.reviewedAt?.toISOString() ?? null,
          documentUrl: opts.includeDocument ? row.prescription.documentUrl : undefined,
        }
      : null,
    paymentReady: row.status === 'READY_FOR_PAYMENT',
    paymentMessage:
      row.status === 'READY_FOR_PAYMENT' ? 'Votre commande est prête pour le paiement.' : null,
  };
}
