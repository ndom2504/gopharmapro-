'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Offer, Product } from '@/lib/catalog';

export type ClientSession = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type CartLine = { product: Product; offer: Offer; quantity: number };

export type ShopOrder = {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  paymentLabel: string;
  fulfillment: 'pickup' | 'delivery';
  items: { name: string; quantity: number; price: number }[];
};

type StoredUser = ClientSession & { password: string };

type ShopCtx = {
  ready: boolean;
  session: ClientSession | null;
  cart: CartLine[];
  orders: ShopOrder[];
  login: (identifier: string, password: string) => 'ok' | 'invalid';
  register: (input: Omit<StoredUser, 'id'>) => 'ok' | 'exists';
  logout: () => void;
  add: (product: Product, offer: Offer) => 'added' | 'different-pharmacy';
  change: (offerId: string, delta: number) => void;
  remove: (offerId: string) => void;
  clearCart: () => void;
  placeOrder: (input: { paymentLabel: string; fulfillment: 'pickup' | 'delivery'; total: number }) => ShopOrder | null;
};

const SESSION_KEY = 'gpp-client';
const USERS_KEY = 'gpp-users';
const CART_KEY = 'gpp-cart';
const ORDERS_KEY = 'gpp-orders';

const seed: StoredUser[] = [
  {
    id: 'c-awa',
    firstName: 'Awa',
    lastName: 'Diop',
    phone: '+241 77 00 00 00',
    email: 'awa@pharmamarket.ga',
    password: 'demo123',
  },
];

const ShopContext = createContext<ShopCtx | null>(null);

function digits(value: string) {
  return value.replace(/\D/g, '').replace(/^241/, '').replace(/^0/, '');
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>(seed);
  const [session, setSession] = useState<ClientSession | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);

  useEffect(() => {
    const storedUsers = read<StoredUser[]>(USERS_KEY, []);
    const merged = [...seed];
    for (const u of storedUsers) {
      if (!merged.some((x) => x.id === u.id || x.email === u.email)) merged.push(u);
    }
    setUsers(merged);
    setSession(read<ClientSession | null>(SESSION_KEY, null));
    setCart(read<CartLine[]>(CART_KEY, []));
    setOrders(read<ShopOrder[]>(ORDERS_KEY, []));
    setReady(true);
  }, []);

  const persistUsers = (next: StoredUser[]) => {
    setUsers(next);
    write(USERS_KEY, next);
  };

  const value = useMemo<ShopCtx>(
    () => ({
      ready,
      session,
      cart,
      orders,
      login: (identifier, password) => {
        const id = identifier.trim().toLowerCase();
        const phone = digits(identifier);
        const user = users.find(
          (u) =>
            u.password === password &&
            (u.email.toLowerCase() === id || (phone.length >= 7 && digits(u.phone) === phone)),
        );
        if (!user) return 'invalid';
        const next = { id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email };
        setSession(next);
        write(SESSION_KEY, next);
        return 'ok';
      },
      register: (input) => {
        if (users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase() || digits(u.phone) === digits(input.phone))) {
          return 'exists';
        }
        const user: StoredUser = { ...input, id: 'c-' + Date.now(), email: input.email.trim().toLowerCase() };
        persistUsers([user, ...users]);
        const next = { id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email };
        setSession(next);
        write(SESSION_KEY, next);
        return 'ok';
      },
      logout: () => {
        setSession(null);
        localStorage.removeItem(SESSION_KEY);
      },
      add: (product, offer) => {
        if (cart.length && cart[0].offer.pharmacy.id !== offer.pharmacy.id) return 'different-pharmacy';
        const found = cart.find((i) => i.offer.id === offer.id);
        const next = found
          ? cart.map((i) => (i.offer.id === offer.id ? { ...i, quantity: i.quantity + 1 } : i))
          : [...cart, { product, offer, quantity: 1 }];
        setCart(next);
        write(CART_KEY, next);
        return 'added';
      },
      change: (offerId, delta) => {
        const next = cart.map((i) => (i.offer.id === offerId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
        setCart(next);
        write(CART_KEY, next);
      },
      remove: (offerId) => {
        const next = cart.filter((i) => i.offer.id !== offerId);
        setCart(next);
        write(CART_KEY, next);
      },
      clearCart: () => {
        setCart([]);
        write(CART_KEY, []);
      },
      placeOrder: (input) => {
        if (!cart.length) return null;
        const order: ShopOrder = {
          id: 'PM-' + String(1000 + orders.length + 1),
          createdAt: new Date().toISOString(),
          total: input.total,
          status: 'Payée',
          paymentLabel: input.paymentLabel,
          fulfillment: input.fulfillment,
          items: cart.map((i) => ({ name: i.product.name, quantity: i.quantity, price: i.offer.price })),
        };
        const next = [order, ...orders];
        setOrders(next);
        write(ORDERS_KEY, next);
        setCart([]);
        write(CART_KEY, []);
        return order;
      },
    }),
    [ready, session, cart, orders, users],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop');
  return ctx;
}
