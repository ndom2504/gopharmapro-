import { pharmacyAccountIdFor } from './payouts';

export type RxStatus = 'sent' | 'review' | 'approved' | 'rejected';
export type RxKind = 'image' | 'pdf';
export type RxGate = 'none' | 'missing' | 'pending' | 'rejected' | 'approved';

export type PrescriptionItem = {
  id: string;
  clientId: string;
  clientName: string;
  pharmacyId: string;
  pharmacyAccountId: string;
  pharmacyName: string;
  fileName: string;
  fileUri: string;
  kind: RxKind;
  products: string[];
  productIds: string[];
  createdAt: string;
  status: RxStatus;
  note?: string;
  reviewedAt?: string;
};

export const rxStatusLabel: Record<RxStatus, string> = {
  sent: 'En attente',
  review: 'En vérification',
  approved: 'Validée',
  rejected: 'Refusée',
};

export const rxStatusTone: Record<RxStatus, 'orange' | 'gray' | 'green' | 'red'> = {
  sent: 'orange',
  review: 'gray',
  approved: 'green',
  rejected: 'red',
};

type CartLike = {
  product: { id: string; name: string; requiresPrescription: boolean };
  offer: { pharmacy: { id: string; name: string } };
};

function covers(rx: PrescriptionItem, productIds: string[]) {
  if (!rx.productIds.length) return true;
  return productIds.every((id) => rx.productIds.includes(id));
}

export function cartRxLines(items: CartLike[]) {
  return items.filter((i) => i.product.requiresPrescription);
}

export function cartRxContext(items: CartLike[]) {
  const lines = cartRxLines(items);
  if (!lines.length) return null;
  const pharmacy = lines[0].offer.pharmacy;
  return {
    pharmacyId: pharmacy.id,
    pharmacyAccountId: pharmacyAccountIdFor(pharmacy),
    pharmacyName: pharmacy.name,
    productIds: [...new Set(lines.map((i) => i.product.id))],
    products: [...new Set(lines.map((i) => i.product.name))],
  };
}

export function cartRxGate(
  items: CartLike[],
  prescriptions: PrescriptionItem[],
  clientId?: string,
): { gate: RxGate; latest?: PrescriptionItem; pharmacyName?: string } {
  const ctx = cartRxContext(items);
  if (!ctx) return { gate: 'none' };
  if (!clientId) return { gate: 'missing', pharmacyName: ctx.pharmacyName };
  const mine = prescriptions
    .filter((p) => p.pharmacyAccountId === ctx.pharmacyAccountId && (!clientId || p.clientId === clientId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const approved = mine.find((p) => p.status === 'approved' && covers(p, ctx.productIds));
  if (approved) return { gate: 'approved', latest: approved, pharmacyName: ctx.pharmacyName };
  const pending = mine.find((p) => (p.status === 'sent' || p.status === 'review') && covers(p, ctx.productIds));
  if (pending) return { gate: 'pending', latest: pending, pharmacyName: ctx.pharmacyName };
  const rejected = mine.find((p) => p.status === 'rejected' && covers(p, ctx.productIds));
  if (rejected) return { gate: 'rejected', latest: rejected, pharmacyName: ctx.pharmacyName };
  return { gate: 'missing', pharmacyName: ctx.pharmacyName };
}

export function rxPayBlocked(gate: RxGate) {
  return gate === 'missing' || gate === 'pending' || gate === 'rejected';
}
