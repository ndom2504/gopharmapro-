import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { PaymentMethodId } from '../types';
import { DEMO_COURIER_ID, demoPayoutPhone, payoutMethodForPhone } from '../lib/payouts';
import { getPaymentMethod } from '../data/payments';
import { Order } from '../types';

const KEY = 'pharmarket-payouts-v1';

export type PayoutStatus = 'pending' | 'sent';
export type PayoutBeneficiary = 'pharmacy' | 'courier';

export type Payout = {
  id: string;
  orderId: string;
  beneficiary: PayoutBeneficiary;
  accountId: string;
  amount: number;
  status: PayoutStatus;
  method: PaymentMethodId;
  phone: string;
  createdAt: string;
  sentAt?: string;
};

type PayoutStore = {
  hydrated: boolean;
  items: Payout[];
  hydrate: () => Promise<void>;
  creditOrder: (order: Order, pharmacyPhone?: string, courierPhone?: string) => Payout[];
  markSent: (id: string) => void;
};

let items: Payout[] = [];

const seed: Payout[] = [
  {
    id: 'po-ph-1024',
    orderId: 'PM-1024',
    beneficiary: 'pharmacy',
    accountId: 'ph-centre',
    amount: 4324,
    status: 'sent',
    method: 'airtel-money',
    phone: '+241 77 11 22 33',
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
  },
  {
    id: 'po-d-1024',
    orderId: 'PM-1024',
    beneficiary: 'courier',
    accountId: DEMO_COURIER_ID,
    amount: 1000,
    status: 'pending',
    method: 'moov-money',
    phone: '+241 66 00 00 00',
    createdAt: new Date().toISOString(),
  },
];

async function persist() {
  await AsyncStorage.setItem(KEY, JSON.stringify({ items }));
}

function makePayout(
  order: Order,
  beneficiary: PayoutBeneficiary,
  accountId: string,
  amount: number,
  phone: string,
): Payout {
  const method = payoutMethodForPhone(phone);
  return {
    id: 'po-' + beneficiary.slice(0, 2) + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
    orderId: order.id,
    beneficiary,
    accountId,
    amount,
    status: 'pending',
    method,
    phone,
    createdAt: new Date().toISOString(),
  };
}

export function totalsFor(list: Payout[], accountId: string) {
  const mine = list.filter((p) => p.accountId === accountId);
  const pending = mine.filter((p) => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
  const sent = mine.filter((p) => p.status === 'sent').reduce((a, p) => a + p.amount, 0);
  return { pending, sent, total: pending + sent, count: mine.length };
}

export function methodLabel(id: PaymentMethodId) {
  return getPaymentMethod(id).name;
}

export const usePayouts = create<PayoutStore>((set) => ({
  hydrated: false,
  items: [...seed],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: Payout[] };
        if (parsed.items?.length) items = parsed.items;
      } else {
        items = [...seed];
        await persist();
      }
    } catch {
      items = [...seed];
    }
    set({ items, hydrated: true });
  },
  creditOrder: (order, pharmacyPhone, courierPhone) => {
    const already = items.some((p) => p.orderId === order.id);
    if (already) return items.filter((p) => p.orderId === order.id);
    const phPhone = pharmacyPhone || demoPayoutPhone(order.pharmacyAccountId, 'pharmacy') || order.payment.phone;
    const dPhone = courierPhone || demoPayoutPhone(order.courierId || DEMO_COURIER_ID, 'courier');
    const created: Payout[] = [
      makePayout(order, 'pharmacy', order.pharmacyAccountId, order.split.pharmacyNet, phPhone),
    ];
    if (order.split.courierNet > 0) {
      created.push(makePayout(order, 'courier', order.courierId || DEMO_COURIER_ID, order.split.courierNet, dPhone));
    }
    items = [...created, ...items];
    set({ items });
    persist();
    return created;
  },
  markSent: (id) => {
    items = items.map((p) => (p.id === id ? { ...p, status: 'sent' as const, sentAt: new Date().toISOString() } : p));
    set({ items });
    persist();
  },
}));
