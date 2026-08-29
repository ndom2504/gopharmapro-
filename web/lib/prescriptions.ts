'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { pharmacyAccountIdFor, type Product, type Offer } from './catalog';

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

export const rxStatusClass: Record<RxStatus, string> = {
  sent: 'badge-orange',
  review: 'badge-orange',
  approved: 'badge-green',
  rejected: 'badge-red',
};

const KEY = 'gpp-rx-v1';
const listeners = new Set<() => void>();
let cache: PrescriptionItem[] | null = null;

function read(): PrescriptionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}') as { items?: PrescriptionItem[] };
    return Array.isArray(raw.items) ? raw.items : [];
  } catch {
    return [];
  }
}

function snapshot() {
  if (!cache) cache = read();
  return cache;
}

function write(next: PrescriptionItem[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify({ items: next }));
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (typeof window !== 'undefined') {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        cache = read();
        listeners.forEach((l) => l());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', onStorage);
    };
  }
  return () => listeners.delete(cb);
}

type CartLike = { product: Product; offer: Offer };

function covers(rx: PrescriptionItem, productIds: string[]) {
  if (!rx.productIds.length) return true;
  return productIds.every((id) => rx.productIds.includes(id));
}

export function cartRxContext(items: CartLike[]) {
  const lines = items.filter((i) => i.product.requiresPrescription);
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

export function cartRxGate(items: CartLike[], prescriptions: PrescriptionItem[], clientId?: string) {
  const ctx = cartRxContext(items);
  if (!ctx) return { gate: 'none' as RxGate };
  if (!clientId) return { gate: 'missing' as RxGate, pharmacyName: ctx.pharmacyName };
  const mine = prescriptions
    .filter((p) => p.pharmacyAccountId === ctx.pharmacyAccountId && (!clientId || p.clientId === clientId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const approved = mine.find((p) => p.status === 'approved' && covers(p, ctx.productIds));
  if (approved) return { gate: 'approved' as RxGate, latest: approved, pharmacyName: ctx.pharmacyName };
  const pending = mine.find((p) => (p.status === 'sent' || p.status === 'review') && covers(p, ctx.productIds));
  if (pending) return { gate: 'pending' as RxGate, latest: pending, pharmacyName: ctx.pharmacyName };
  const rejected = mine.find((p) => p.status === 'rejected' && covers(p, ctx.productIds));
  if (rejected) return { gate: 'rejected' as RxGate, latest: rejected, pharmacyName: ctx.pharmacyName };
  return { gate: 'missing' as RxGate, pharmacyName: ctx.pharmacyName };
}

export function rxPayBlocked(gate: RxGate) {
  return gate === 'missing' || gate === 'pending' || gate === 'rejected';
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Impossible de lire ce fichier.'));
    reader.readAsDataURL(file);
  });
}

export async function readRxFile(file: File): Promise<{ fileUri: string; fileName: string; kind: RxKind }> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    if (file.size > 4 * 1024 * 1024) throw new Error('PDF trop lourd (4 Mo maximum).');
    return { fileUri: await fileToDataUrl(file), fileName: file.name || 'ordonnance.pdf', kind: 'pdf' };
  }
  if (!file.type.startsWith('image/')) throw new Error('Choisissez une photo JPG/PNG ou un PDF.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Image trop lourde (15 Mo maximum).');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Impossible de lire cette image.'));
      el.src = url;
    });
    const max = 1400;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Impossible de lire cette image.');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return {
      fileUri: canvas.toDataURL('image/jpeg', 0.82),
      fileName: (file.name.replace(/\.[^.]+$/, '') || 'ordonnance') + '.jpg',
      kind: 'image',
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function usePrescriptions() {
  const items = useSyncExternalStore(subscribe, snapshot, () => []);
  const add = useCallback(
    (input: Omit<PrescriptionItem, 'id' | 'createdAt' | 'status'> & { status?: RxStatus }) => {
      const next: PrescriptionItem = {
        ...input,
        id: 'rx-' + Date.now(),
        createdAt: new Date().toISOString(),
        status: input.status || 'sent',
      };
      write([next, ...snapshot()]);
      return next;
    },
    [],
  );
  const setStatus = useCallback((id: string, status: Exclude<RxStatus, 'sent'>, note?: string) => {
    write(
      snapshot().map((r) =>
        r.id === id ? { ...r, status, note: note || r.note, reviewedAt: new Date().toISOString() } : r,
      ),
    );
  }, []);
  return { items, add, setStatus };
}
