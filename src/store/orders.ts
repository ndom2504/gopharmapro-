import { create } from 'zustand';
import { CartItem, Order, OrderPayment } from '../types';

type OrdersStore = {
  orders: Order[];
  add: (order: Omit<Order, 'id' | 'createdAt' | 'status'> & { id?: string }) => Order;
  get: (id: string) => Order | undefined;
};

const demo: Order = {
  id: 'PM-1024',
  items: [],
  pharmacyName: 'Pharmacie du Centre',
  eta: '25-35 min',
  subtotal: 4700,
  fee: 1000,
  total: 5700,
  payment: {
    method: 'airtel-money',
    methodLabel: 'Airtel Money',
    phone: '+241 77 00 00 00',
    status: 'paid',
    reference: 'AM-8F2K19',
  },
  deliveryAddress: 'Libreville, Gabon',
  status: 'preparing',
  createdAt: new Date().toISOString(),
};

export const useOrders = create<OrdersStore>((set, get) => ({
  orders: [demo],
  add: (payload) => {
    const id = payload.id || 'PM-' + (1024 + get().orders.length);
    const order: Order = {
      ...payload,
      id,
      status: 'paid',
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ orders: [order, ...s.orders] }));
    return order;
  },
  get: (id) => get().orders.find((o) => o.id === id),
}));

export function buildPayment(methodLabel: string, method: OrderPayment['method'], phone: string): OrderPayment {
  const prefix = method === 'airtel-money' ? 'AM' : method === 'moov-money' ? 'MM' : 'MC';
  const reference = prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return { method, methodLabel, phone, status: 'paid', reference };
}

export function orderFromCart(
  items: CartItem[],
  payment: OrderPayment,
  subtotal: number,
  fee: number,
  deliveryAddress: string,
) {
  const pharmacy = items[0].offer.pharmacy;
  return {
    items,
    pharmacyName: pharmacy.name,
    eta: pharmacy.eta,
    subtotal,
    fee,
    total: subtotal + fee,
    payment,
    deliveryAddress,
  };
}
