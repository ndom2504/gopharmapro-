const KEY = 'gpp-client-order-draft';

export type ClientOrderLine = {
  pharmacyId: string;
  pharmacyName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  fulfillment: 'pickup' | 'delivery';
  deliveryAddress?: string;
};

export function readOrderDraft(): ClientOrderLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) || '[]') as ClientOrderLine[];
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function addOrderDraftLine(line: ClientOrderLine) {
  const next = [...readOrderDraft().filter((l) => !(l.pharmacyId === line.pharmacyId && l.productId === line.productId)), line];
  sessionStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
