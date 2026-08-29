import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useNotifications } from './notifications';
import {
  type PrescriptionItem,
  type RxStatus,
  rxStatusLabel,
  rxStatusTone,
} from '../lib/rxGate';

export type { PrescriptionItem, RxStatus };
export { rxStatusLabel, rxStatusTone };

const KEY = 'gpp-rx-v1';

type RxStore = {
  hydrated: boolean;
  items: PrescriptionItem[];
  hydrate: () => Promise<void>;
  add: (item: Omit<PrescriptionItem, 'id' | 'createdAt' | 'status'> & { status?: RxStatus }) => PrescriptionItem;
  setStatus: (id: string, status: Exclude<RxStatus, 'sent'>, note?: string) => void;
  get: (id: string) => PrescriptionItem | undefined;
};

function persist(items: PrescriptionItem[]) {
  AsyncStorage.setItem(KEY, JSON.stringify({ items }));
}

function notify(input: Parameters<ReturnType<typeof useNotifications.getState>['push']>[0]) {
  useNotifications.getState().push(input);
}

export const usePrescriptions = create<RxStore>((set, get) => ({
  hydrated: false,
  items: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: PrescriptionItem[] };
        if (parsed.items) set({ items: parsed.items, hydrated: true });
        else set({ hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  add: (item) => {
    const next: PrescriptionItem = {
      ...item,
      id: 'rx-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: item.status || 'sent',
    };
    const items = [next, ...get().items];
    set({ items });
    persist(items);
    notify({
      audience: 'pharmacy',
      targetId: next.pharmacyAccountId,
      type: 'prescription',
      title: 'Nouvelle ordonnance',
      body: next.clientName + ' a transmis ' + next.fileName + (next.products.length ? ' · ' + next.products.join(', ') : '') + '.',
    });
    return next;
  },
  setStatus: (id, status, note) => {
    const current = get().items.find((r) => r.id === id);
    if (!current) return;
    const items = get().items.map((r) =>
      r.id === id ? { ...r, status, note: note || r.note, reviewedAt: new Date().toISOString() } : r,
    );
    set({ items });
    persist(items);
    const approved = status === 'approved';
    notify({
      audience: 'client',
      targetId: current.clientId,
      type: 'prescription',
      title: approved ? 'Ordonnance validée' : 'Ordonnance refusée',
      body: approved
        ? current.pharmacyName + ' a validé votre ordonnance. Vous pouvez payer.'
        : current.pharmacyName + ' a refusé votre ordonnance' + (note ? ' : ' + note : '.') + ' Transmettez un fichier lisible.',
    });
  },
  get: (id) => get().items.find((r) => r.id === id),
}));
