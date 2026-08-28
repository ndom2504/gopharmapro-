import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { AppState } from 'react-native';
import { presentLocalNotification } from '../lib/notifyLocal';
import { playNotifySound, notifyHaptic } from '../lib/notifySound';
import { NotificationType } from '../lib/notifyUi';
import { UserRole } from '../types';
import { useAuth } from './auth';

export type { NotificationType };

const KEY = 'pharmarket-notifications-v1';
const PREFS_KEY = 'pharmarket-notif-prefs-v1';

export type AppNotification = {
  id: string;
  audience: UserRole;
  targetId?: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type ClientNotifPrefs = {
  newProducts: boolean;
  stock: boolean;
  sound: boolean;
  popup: boolean;
};

const defaultPrefs: ClientNotifPrefs = { newProducts: true, stock: true, sound: true, popup: true };

type NotifStore = {
  hydrated: boolean;
  items: AppNotification[];
  prefs: ClientNotifPrefs;
  toast: AppNotification | null;
  hydrate: () => Promise<void>;
  push: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'> & { local?: boolean }) => void;
  markRead: (id: string) => void;
  markAllRead: (audience: UserRole, targetId?: string) => void;
  setPrefs: (patch: Partial<ClientNotifPrefs>) => void;
  dismissToast: () => void;
};

let items: AppNotification[] = [];
let prefs: ClientNotifPrefs = { ...defaultPrefs };

const seed: AppNotification[] = [
  {
    id: 'n-pay-ph',
    audience: 'pharmacy',
    targetId: 'ph-centre',
    type: 'payment',
    title: 'Paiement reçu',
    body: 'Commande PM-1024 · 4 324 FCFA à verser sur Airtel Money (+241 77 11 22 33).',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'n-pay-d',
    audience: 'courier',
    targetId: 'd-jean',
    type: 'payment',
    title: 'Course payée',
    body: 'Livraison PM-1024 · 1 000 FCFA à verser sur Moov Money (+241 66 00 00 00).',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 'n-cat',
    audience: 'client',
    type: 'catalog_new',
    title: 'Nouveau médicament',
    body: 'Vitamine C 1000 mg est disponible chez Pharmacie du Centre.',
    createdAt: new Date().toISOString(),
    read: false,
  },
];

async function persist() {
  await AsyncStorage.setItem(KEY, JSON.stringify({ items }));
}

async function persistPrefs() {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function visibleFor(list: AppNotification[], audience: UserRole, targetId?: string) {
  return list.filter((n) => {
    if (n.audience !== audience) return false;
    if (audience === 'client') return true;
    if (!n.targetId) return true;
    return n.targetId === targetId;
  });
}

export const useNotifications = create<NotifStore>((set, get) => ({
  hydrated: false,
  items: [...seed],
  prefs: { ...defaultPrefs },
  toast: null,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: AppNotification[] };
        if (parsed.items?.length) items = parsed.items;
      } else {
        items = [...seed];
        await persist();
      }
      const prefRaw = await AsyncStorage.getItem(PREFS_KEY);
      if (prefRaw) prefs = { ...defaultPrefs, ...(JSON.parse(prefRaw) as Partial<ClientNotifPrefs>) };
    } catch {
      items = [...seed];
    }
    set({ items, prefs, hydrated: true });
  },
  push: (input) => {
    if (input.audience === 'client') {
      const p = get().prefs;
      if (input.type === 'catalog_new' && !p.newProducts) return;
      if (input.type === 'catalog_stock' && !p.stock) return;
    }
    const next: AppNotification = {
      id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      audience: input.audience,
      targetId: input.targetId,
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt: new Date().toISOString(),
      read: false,
    };
    items = [next, ...items].slice(0, 80);
    set({ items });
    persist();
    if (input.local === false) return;
    const session = useAuth.getState().session;
    const role = session?.role || 'client';
    const sameRole = next.audience === role;
    const sameTarget = next.audience === 'client' || !next.targetId || !session || next.targetId === session.id;
    if (!sameRole || !sameTarget) return;
    const p = get().prefs;
    const inApp = AppState.currentState === 'active';
    if (inApp) {
      if (p.popup) set({ toast: next });
      if (p.sound) {
        playNotifySound(next.type);
        notifyHaptic(next.type);
      }
    } else {
      presentLocalNotification(next.title, next.body, next.type, p.sound);
    }
  },
  markRead: (id) => {
    items = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    set({ items });
    persist();
  },
  markAllRead: (audience, targetId) => {
    items = items.map((n) => {
      if (n.audience !== audience) return n;
      if (audience !== 'client' && n.targetId && n.targetId !== targetId) return n;
      return { ...n, read: true };
    });
    set({ items });
    persist();
  },
  setPrefs: (patch) => {
    prefs = { ...prefs, ...patch };
    set({ prefs });
    persistPrefs();
  },
  dismissToast: () => set({ toast: null }),
}));
