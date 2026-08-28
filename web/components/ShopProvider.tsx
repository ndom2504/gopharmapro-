'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Offer, Product } from '@/lib/catalog';
import {
  accountSeed,
  courierDocs,
  isClient,
  pharmacyDocs,
  stripPassword,
  type CourierRegisterInput,
  type PharmacyRegisterInput,
  type ShopSession,
  type StoredAccount,
  type UserRole,
} from '@/lib/accounts';
import type { GoogleProfile, GoogleRole } from '@/lib/google';

export type CartLine = { product: Product; offer: Offer; quantity: number };

export type ShopOrder = {
  id: string;
  createdAt: string;
  total: number;
  status: 'paid' | 'preparing' | 'ready' | 'picked_up' | 'delivered';
  paymentLabel: string;
  fulfillment: 'pickup' | 'delivery';
  items: { name: string; quantity: number; price: number }[];
};

type ShopCtx = {
  ready: boolean;
  session: ShopSession | null;
  cart: CartLine[];
  orders: ShopOrder[];
  login: (identifier: string, password: string, role: UserRole) => 'ok' | 'invalid';
  register: (input: { firstName: string; lastName: string; email: string; phone: string; password: string }) => 'ok' | 'exists';
  registerPharmacy: (input: PharmacyRegisterInput) => 'ok' | 'exists';
  registerCourier: (input: CourierRegisterInput) => 'ok' | 'exists';
  loginWithGoogle: (profile: GoogleProfile, role: GoogleRole) => 'ok' | 'conflict' | 'error';
  logout: () => void;
  add: (product: Product, offer: Offer) => 'added' | 'different-pharmacy' | 'partner';
  change: (offerId: string, delta: number) => void;
  remove: (offerId: string) => void;
  clearCart: () => void;
  placeOrder: (input: { paymentLabel: string; fulfillment: 'pickup' | 'delivery'; total: number }) => ShopOrder | null;
};

const SESSION_KEY = 'gpp-session-v2';
const USERS_KEY = 'gpp-accounts-v2';
const CART_KEY = 'gpp-cart';
const ORDERS_KEY = 'gpp-orders';
const DEMO_ORDERS: ShopOrder[] = [
  {
    id: 'GP-10482',
    createdAt: '2026-08-28T10:00:00.000Z',
    total: 12500,
    status: 'picked_up',
    paymentLabel: 'Airtel Money',
    fulfillment: 'delivery',
    items: [
      { name: 'Paracétamol 500 mg', quantity: 2, price: 3500 },
      { name: 'Vitamine C', quantity: 1, price: 4500 },
    ],
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

function coerceSession(raw: unknown): ShopSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<ShopSession> & { firstName?: string; pharmacyName?: string };
  if (s.role === 'pharmacy' || s.role === 'courier' || s.role === 'client') return s as ShopSession;
  if (s.pharmacyName) return { ...(s as object), role: 'pharmacy' } as ShopSession;
  if (s.firstName) return { ...(s as object), role: 'client' } as ShopSession;
  return null;
}

const ShopContextInner = ShopContext;

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState<StoredAccount[]>(accountSeed);
  const [session, setSession] = useState<ShopSession | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);

  useEffect(() => {
    const storedUsers = read<StoredAccount[]>(USERS_KEY, []);
    const merged = [...accountSeed];
    for (const u of storedUsers) {
      if (!u?.role || !u.id) continue;
      if (!merged.some((x) => x.id === u.id || (x.role === u.role && x.email === u.email))) merged.push(u);
    }
    setUsers(merged);
    setSession(coerceSession(read<unknown>(SESSION_KEY, null)));
    setCart(read<CartLine[]>(CART_KEY, []));
    const storedOrders = read<ShopOrder[]>(ORDERS_KEY, []);
    setOrders(storedOrders.length ? storedOrders : DEMO_ORDERS);
    setReady(true);
  }, []);

  const persistUsers = (next: StoredAccount[]) => {
    setUsers(next);
    write(USERS_KEY, next);
  };

  const persistSession = (next: ShopSession | null) => {
    setSession(next);
    if (next) write(SESSION_KEY, next);
    else localStorage.removeItem(SESSION_KEY);
  };

  const value = useMemo<ShopCtx>(
    () => ({
      ready,
      session,
      cart,
      orders,
      login: (identifier, password, role) => {
        const id = identifier.trim().toLowerCase();
        const phone = digits(identifier);
        const user = users.find(
          (u) =>
            u.role === role &&
            !!u.password &&
            u.password === password &&
            (u.email.toLowerCase() === id || (phone.length >= 7 && digits(u.phone) === phone)),
        );
        if (!user) return 'invalid';
        persistSession(stripPassword(user));
        return 'ok';
      },
      register: (input) => {
        const email = input.email.trim().toLowerCase();
        if (
          users.some(
            (u) =>
              u.role === 'client' &&
              (u.email.toLowerCase() === email || digits(u.phone) === digits(input.phone)),
          )
        ) {
          return 'exists';
        }
        const user: StoredAccount = {
          role: 'client',
          id: 'c-' + Date.now(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email,
          phone: input.phone.trim(),
          password: input.password,
          provider: 'password',
        };
        persistUsers([user, ...users]);
        persistSession(stripPassword(user));
        return 'ok';
      },
      registerPharmacy: (input) => {
        const email = input.email.trim().toLowerCase();
        if (
          users.some(
            (u) =>
              u.role === 'pharmacy' &&
              (u.email.toLowerCase() === email || digits(u.phone) === digits(input.phone)),
          )
        ) {
          return 'exists';
        }
        const user: StoredAccount = {
          role: 'pharmacy',
          id: 'ph-' + Date.now(),
          pharmacyName: input.pharmacyName.trim(),
          pharmacistName: input.pharmacistName.trim(),
          professionalNumber: input.professionalNumber.trim(),
          phone: input.phone.trim(),
          email,
          password: input.password,
          address: input.address.trim(),
          area: input.area.trim() || 'Centre-ville',
          commune: input.city.trim() || 'Libreville',
          city: input.city.trim() || 'Libreville',
          province: 'Estuaire',
          managerRole: 'titulaire',
          status: 'pending',
          documents: pharmacyDocs('pending', false),
        };
        persistUsers([user, ...users]);
        persistSession(stripPassword(user));
        return 'ok';
      },
      registerCourier: (input) => {
        const email = input.email.trim().toLowerCase();
        if (
          users.some(
            (u) =>
              u.role === 'courier' &&
              (u.email.toLowerCase() === email || digits(u.phone) === digits(input.phone)),
          )
        ) {
          return 'exists';
        }
        const user: StoredAccount = {
          role: 'courier',
          id: 'd-' + Date.now(),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          phone: input.phone.trim(),
          email,
          password: input.password,
          vehicle: input.vehicle || 'moto',
          plate: input.plate.trim().toUpperCase(),
          area: '',
          city: input.city.trim() || 'Libreville',
          province: 'Estuaire',
          payoutPhone: input.phone.trim(),
          status: 'pending',
          documents: courierDocs('pending', false),
          provider: 'password',
        };
        persistUsers([user, ...users]);
        persistSession(stripPassword(user));
        return 'ok';
      },
      loginWithGoogle: (profile, role) => {
        if (!profile.email) return 'error';
        const email = profile.email.toLowerCase();
        if (users.some((u) => u.email && u.email.toLowerCase() === email && u.role !== role)) return 'conflict';
        const existing = users.find((u) => {
          if (u.role !== role) return false;
          if (u.email.toLowerCase() === email) return true;
          return (u.role === 'client' || u.role === 'courier') && u.googleId && u.googleId === profile.googleId;
        });
        if (existing && (existing.role === 'client' || existing.role === 'courier')) {
          const updated: StoredAccount = {
            ...existing,
            googleId: profile.googleId || existing.googleId,
            firstName: existing.firstName || profile.firstName,
            lastName: existing.lastName || profile.lastName,
            email: existing.email || email,
            provider: existing.provider || 'google',
          };
          persistUsers(users.map((u) => (u.id === existing.id ? updated : u)));
          persistSession(stripPassword(updated));
          return 'ok';
        }
        const user: StoredAccount =
          role === 'courier'
            ? {
                role: 'courier',
                id: 'd-google-' + (profile.googleId || Date.now()),
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: '',
                email,
                password: '',
                vehicle: 'moto',
                plate: '',
                area: '',
                city: 'Libreville',
                province: 'Estuaire',
                payoutPhone: '',
                status: 'pending',
                documents: courierDocs('pending', false),
                provider: 'google',
                googleId: profile.googleId,
              }
            : {
                role: 'client',
                id: 'c-google-' + (profile.googleId || Date.now()),
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: '',
                email,
                password: '',
                provider: 'google',
                googleId: profile.googleId,
              };
        persistUsers([user, ...users]);
        persistSession(stripPassword(user));
        return 'ok';
      },
      logout: () => {
        persistSession(null);
      },
      add: (product, offer) => {
        if (session && !isClient(session)) return 'partner';
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
        if (!cart.length || !isClient(session)) return null;
        const order: ShopOrder = {
          id: 'GP-' + String(10490 + orders.length),
          createdAt: new Date().toISOString(),
          total: input.total,
          status: 'paid',
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

  return <ShopContextInner.Provider value={value}>{children}</ShopContextInner.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop');
  return ctx;
}

export type { ShopSession };
