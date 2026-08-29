import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { CartItem, Fulfillment, Order, OrderPayment, OrderStatus } from '../types';
import { DEMO_COURIER_ID, pharmacyAccountIdFor, splitPayment } from '../lib/payouts';
import { codesMatch, makeSecureCode, MAX_CODE_ATTEMPTS } from '../lib/deliveryCodes';
import { isDelivery } from '../lib/orderStatus';
import { useNotifications } from './notifications';

const KEY = 'pharmarket-orders-v4';

export type CodeResult = 'ok' | 'wrong' | 'not_ready' | 'locked' | 'already';

type OrdersStore = {
  hydrated: boolean;
  orders: Order[];
  hydrate: () => Promise<void>;
  add: (order: Omit<Order, 'id' | 'createdAt' | 'status' | 'pickupAttempts' | 'deliveryAttempts'> & { id?: string }) => Order;
  get: (id: string) => Order | undefined;
  setStatus: (id: string, status: OrderStatus) => void;
  acceptRun: (id: string, courierId: string) => boolean;
  confirmPickup: (id: string, code: string) => CodeResult;
  confirmDelivery: (id: string, code: string) => CodeResult;
};

const demoItems = [
  {
    product: {
      id: 'paracetamol',
      name: 'Paracétamol 500 mg',
      genericName: 'Paracétamol',
      dosage: '500 mg',
      form: 'Comprimés',
      category: 'Médicaments',
      subcategory: 'Antalgiques & fièvre',
      regulatoryStatus: 'otc',
      description: '',
      requiresPrescription: false,
      offers: [],
    },
    offer: {
      id: 'o1',
      pharmacy: {
        id: 'p1',
        name: 'Pharmacie du Centre',
        area: 'Centre-ville',
        latitude: 0.39,
        longitude: 9.45,
        distance: 0.8,
        rating: 4.8,
        open: true,
        delivery: true,
        pickup: true,
        fee: 1000,
        eta: '25 min',
      },
      price: 3500,
      stock: 20,
    },
    quantity: 2,
  },
];

const demo: Order = {
  id: 'GP-10482',
  items: demoItems as Order['items'],
  pharmacyId: 'p1',
  pharmacyAccountId: 'ph-centre',
  pharmacyName: 'Pharmacie du Centre',
  fulfillment: 'delivery',
  courierId: DEMO_COURIER_ID,
  pickupCode: '482193',
  deliveryCode: '739204',
  pickupAttempts: 0,
  deliveryAttempts: 0,
  eta: '15 min',
  subtotal: 7000,
  fee: 2000,
  total: 9000,
  split: splitPayment(7000, 2000),
  payment: {
    method: 'airtel-money',
    methodLabel: 'Airtel Money',
    phone: '+241 77 00 00 00',
    status: 'paid',
    reference: 'AM-8F2K19',
  },
  deliveryAddress: 'Libreville, Gabon',
  status: 'picked_up',
  createdAt: new Date().toISOString(),
};

const openJob: Order = {
  ...demo,
  id: 'GP-10490',
  courierId: undefined,
  status: 'ready',
  deliveryCode: '5184',
  pickupCode: '220911',
  fee: 2000,
  total: 9000,
  eta: '25 min',
};

let orders: Order[] = [demo, openJob];

async function persist() {
  await AsyncStorage.setItem(KEY, JSON.stringify({ orders }));
}

function withSecure(order: Order): Order {
  const fulfillment: Fulfillment = order.fulfillment || (order.fee > 0 ? 'delivery' : 'pickup');
  const delivery = fulfillment === 'delivery';
  const fee = delivery ? order.fee : 0;
  const split = order.split || splitPayment(order.subtotal, fee);
  const status: OrderStatus =
    order.status === 'picked_up' || order.status === 'delivered' || order.status === 'ready' || order.status === 'preparing' || order.status === 'paid'
      ? order.status
      : 'paid';
  return {
    ...order,
    pharmacyId: order.pharmacyId || 'p1',
    pharmacyAccountId: order.pharmacyAccountId || 'ph-centre',
    fulfillment,
    split: delivery ? split : splitPayment(order.subtotal, 0),
    fee,
    total: order.subtotal + fee,
    courierId: delivery ? order.courierId || DEMO_COURIER_ID : undefined,
    pickupCode: order.pickupCode || makeSecureCode(),
    deliveryCode: delivery ? order.deliveryCode || makeSecureCode() : undefined,
    pickupAttempts: order.pickupAttempts || 0,
    deliveryAttempts: order.deliveryAttempts || 0,
    status,
  };
}

function patch(id: string, update: Partial<Order> | ((order: Order) => Partial<Order>)) {
  const current = orders.find((o) => o.id === id);
  if (!current) return undefined;
  const next = { ...current, ...(typeof update === 'function' ? update(current) : update) };
  orders = orders.map((o) => (o.id === id ? next : o));
  return next;
}

function notify(input: Parameters<ReturnType<typeof useNotifications.getState>['push']>[0]) {
  useNotifications.getState().push(input);
}

export const useOrders = create<OrdersStore>((set, get) => ({
  hydrated: false,
  orders: [demo, openJob],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { orders?: Order[] };
        if (parsed.orders?.length) orders = parsed.orders.map(withSecure);
      } else {
        orders = [demo, openJob];
        await persist();
      }
    } catch {
      orders = [demo, openJob];
    }
    set({ orders, hydrated: true });
  },
  add: (payload) => {
    const id = payload.id || 'PM-' + (1024 + get().orders.length);
    const order: Order = withSecure({
      ...payload,
      id,
      status: 'paid',
      createdAt: new Date().toISOString(),
      pickupAttempts: 0,
      deliveryAttempts: 0,
    });
    orders = [order, ...orders];
    set({ orders });
    persist();
    return order;
  },
  get: (id) => get().orders.find((o) => o.id === id),
  acceptRun: (id, courierId) => {
    const order = get().get(id);
    if (!order || order.fulfillment !== 'delivery' || order.courierId) return false;
    patch(id, { courierId });
    set({ orders });
    persist();
    notify({
      audience: 'courier',
      targetId: courierId,
      type: 'delivery',
      title: 'Livraison acceptée',
      body: 'Course ' + id + ' · récupérez le colis à ' + order.pharmacyName + '.',
    });
    return true;
  },
  setStatus: (id, status) => {
    const prev = get().get(id);
    const next = patch(id, { status });
    if (!next || !prev || prev.status === status) return;
    set({ orders });
    persist();
    if (status === 'preparing') {
      notify({
        audience: 'client',
        type: 'delivery',
        title: 'Préparation en cours',
        body: 'La pharmacie prépare la commande ' + id + '.',
      });
    }
    if (status === 'ready') {
      if (isDelivery(next)) {
        notify({
          audience: 'courier',
          targetId: next.courierId,
          type: 'delivery',
          title: 'Commande prête au ramassage',
          body: 'Présentez le code ' + next.pickupCode + ' à ' + next.pharmacyName + ' (commande ' + id + ').',
        });
        notify({
          audience: 'client',
          type: 'delivery',
          title: 'Prête pour le livreur',
          body: 'Votre commande ' + id + ' attend le ramassage. Code de livraison : ' + next.deliveryCode + '.',
        });
      } else {
        notify({
          audience: 'client',
          type: 'delivery',
          title: 'Prête au retrait',
          body: 'Commande ' + id + ' · présentez le code ' + next.pickupCode + ' au comptoir de ' + next.pharmacyName + '.',
        });
      }
    }
  },
  confirmPickup: (id, code) => {
    const order = get().get(id);
    if (!order) return 'wrong';
    if (order.status === 'picked_up' || order.status === 'delivered') return 'already';
    if (order.status !== 'ready') return 'not_ready';
    if (order.pickupAttempts >= MAX_CODE_ATTEMPTS) return 'locked';
    if (!codesMatch(order.pickupCode, code)) {
      patch(id, { pickupAttempts: order.pickupAttempts + 1 });
      set({ orders });
      persist();
      return order.pickupAttempts + 1 >= MAX_CODE_ATTEMPTS ? 'locked' : 'wrong';
    }
    if (!isDelivery(order)) {
      patch(id, { status: 'delivered', deliveredAt: new Date().toISOString(), pickedUpAt: new Date().toISOString(), pickupAttempts: 0 });
      set({ orders });
      persist();
      notify({
        audience: 'pharmacy',
        targetId: order.pharmacyAccountId,
        type: 'delivery',
        title: 'Retrait confirmé',
        body: 'Commande ' + id + ' remise au client au comptoir.',
      });
      notify({
        audience: 'client',
        type: 'delivery',
        title: 'Commande retirée',
        body: 'Vous avez retiré la commande ' + id + ' à ' + order.pharmacyName + '.',
      });
      return 'ok';
    }
    patch(id, { status: 'picked_up', pickedUpAt: new Date().toISOString(), pickupAttempts: 0 });
    set({ orders });
    persist();
    notify({
      audience: 'pharmacy',
      targetId: order.pharmacyAccountId,
      type: 'delivery',
      title: 'Ramassage confirmé',
      body: 'Commande ' + id + ' remise au livreur. En route vers le client.',
    });
    notify({
      audience: 'courier',
      targetId: order.courierId,
      type: 'delivery',
      title: 'Colis ramassé',
      body: 'Demandez le code de livraison au client pour clôturer la course ' + id + '.',
    });
    notify({
      audience: 'client',
      type: 'delivery',
      title: 'Livreur en route',
      body: 'Donnez uniquement au livreur le code ' + order.deliveryCode + '.',
    });
    return 'ok';
  },
  confirmDelivery: (id, code) => {
    const order = get().get(id);
    if (!order) return 'wrong';
    if (!isDelivery(order)) return 'not_ready';
    if (order.status === 'delivered') return 'already';
    if (order.status !== 'picked_up') return 'not_ready';
    if (order.deliveryAttempts >= MAX_CODE_ATTEMPTS) return 'locked';
    if (!order.deliveryCode || !codesMatch(order.deliveryCode, code)) {
      patch(id, { deliveryAttempts: order.deliveryAttempts + 1 });
      set({ orders });
      persist();
      return order.deliveryAttempts + 1 >= MAX_CODE_ATTEMPTS ? 'locked' : 'wrong';
    }
    patch(id, { status: 'delivered', deliveredAt: new Date().toISOString(), deliveryAttempts: 0 });
    set({ orders });
    persist();
    notify({
      audience: 'client',
      type: 'delivery',
      title: 'Commande livrée',
      body: 'La commande ' + id + ' a été remise. Merci d’avoir utilisé Go Pharma Pro.',
    });
    notify({
      audience: 'pharmacy',
      targetId: order.pharmacyAccountId,
      type: 'delivery',
      title: 'Livraison effectuée',
      body: 'Commande ' + id + ' livrée au client.',
    });
    notify({
      audience: 'courier',
      targetId: order.courierId,
      type: 'delivery',
      title: 'Course terminée',
      body: 'Livraison ' + id + ' confirmée par le code client.',
    });
    return 'ok';
  },
}));

export function buildPayment(methodLabel: string, method: OrderPayment['method'], phone: string): OrderPayment {
  const prefix =
    method === 'airtel-money'
      ? 'AM'
      : method === 'moov-money'
        ? 'MM'
        : method === 'card'
          ? 'ST'
          : method === 'geniuspay'
            ? 'GP'
            : 'MC';
  const reference = prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  return { method, methodLabel, phone, status: 'paid', reference };
}

export function orderFromCart(
  items: CartItem[],
  payment: OrderPayment,
  subtotal: number,
  deliveryAddress: string,
  fulfillment: Fulfillment,
) {
  const pharmacy = items[0].offer.pharmacy;
  const delivery = fulfillment === 'delivery';
  const fee = delivery ? pharmacy.fee || 0 : 0;
  return {
    items,
    pharmacyId: pharmacy.id,
    pharmacyAccountId: pharmacyAccountIdFor(pharmacy),
    pharmacyName: pharmacy.name,
    fulfillment,
    courierId: delivery ? undefined : undefined,
    pickupCode: makeSecureCode(),
    deliveryCode: delivery ? makeSecureCode() : undefined,
    eta: delivery ? pharmacy.eta : 'Retrait en pharmacie',
    subtotal,
    fee,
    total: subtotal + fee,
    split: splitPayment(subtotal, fee),
    payment,
    deliveryAddress: delivery ? deliveryAddress : pharmacy.name + ' · ' + pharmacy.area,
  };
}
