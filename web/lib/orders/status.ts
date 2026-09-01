import type { FulfillmentMethod, OrderPrescriptionStatus, OrderStatus } from '@prisma/client';

export const orderStatusLabel: Record<OrderStatus, string> = {
  CART: 'Panier',
  PENDING_PRESCRIPTION: 'En attente de validation de l’ordonnance',
  PRESCRIPTION_REVIEW: 'Ordonnance en cours de vérification',
  READY_FOR_PAYMENT: 'Prête pour le paiement',
  PAYMENT_PENDING: 'Paiement en cours',
  PAID: 'Payée',
  PREPARING: 'En préparation',
  READY_FOR_PICKUP: 'Prête pour le retrait',
  OUT_FOR_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REJECTED: 'Refusée',
};

export const fulfillmentLabel: Record<FulfillmentMethod, string> = {
  PICKUP: 'Retrait en pharmacie',
  DELIVERY: 'Livraison',
};

export const orderPrescriptionLabel: Record<OrderPrescriptionStatus, string> = {
  NOT_REQUIRED: 'Non requise',
  PENDING: 'Ordonnance à envoyer',
  SUBMITTED: 'Ordonnance envoyée',
  APPROVED: 'Ordonnance approuvée',
  REJECTED: 'Ordonnance refusée',
};

export function canClientCancel(status: OrderStatus) {
  return (
    status === 'PENDING_PRESCRIPTION' ||
    status === 'PRESCRIPTION_REVIEW' ||
    status === 'READY_FOR_PAYMENT' ||
    status === 'PAYMENT_PENDING'
  );
}

export function parseFulfillment(value: unknown): FulfillmentMethod | null {
  const s = String(value || '').trim().toUpperCase();
  if (s === 'PICKUP' || s === 'DELIVERY') return s;
  if (s === 'RETRAIT') return 'PICKUP';
  if (s === 'LIVRAISON') return 'DELIVERY';
  return null;
}
