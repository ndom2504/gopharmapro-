import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Href } from 'expo-router';
import { ClientAccount, CourierAccount, PharmacyAccount, Session, UserRole, AdminAccount, DocumentStatus, PharmacyStatus, CourierStatus } from '../types';
import { demoCentrePharmacy, demoOwendoPharmacy, emptyPharmacyForm, toPharmacyAccount } from '../pharmacy-onboarding/defaults';
import { emptyCourierAccount, emptyCourierDocuments } from '../courier-onboarding/defaults';
import { GoogleProfile } from '../lib/google';

const KEY = 'pharmarket-auth-v2';

type StoredUser = (ClientAccount | PharmacyAccount | CourierAccount | AdminAccount) & { password: string };
type GoogleRole = 'client' | 'courier';

type AuthStore = {
  hydrated: boolean;
  session: Session | null;
  guest: boolean;
  hydrate: () => Promise<void>;
  login: (identifier: string, password: string, role: UserRole) => 'ok' | 'invalid';
  registerClient: (
    input: Omit<ClientAccount, 'id' | 'role' | 'provider' | 'googleId'> & {
      password: string;
      provider?: ClientAccount['provider'];
      googleId?: string;
    },
  ) => 'ok' | 'exists';
  registerCourier: (
    input: Omit<CourierAccount, 'id' | 'role' | 'provider' | 'googleId' | 'status'> & {
      password: string;
      provider?: CourierAccount['provider'];
      googleId?: string;
    },
  ) => 'ok' | 'exists';
  registerPharmacy: (input: PharmacyAccount & { password: string }) => 'ok' | 'exists';
  loginWithGoogle: (profile: GoogleProfile, role: GoogleRole) => 'ok' | 'conflict' | 'error';
  continueAsGuest: () => void;
  logout: () => void;
  directory: Session[];
  setPharmacyStatus: (id: string, status: PharmacyStatus) => void;
  setCourierStatus: (id: string, status: CourierStatus) => void;
  setDocumentStatus: (accountId: string, docKey: string, status: DocumentStatus) => void;
};

export function homeFor(role: UserRole): Href {
  if (role === 'pharmacy') return '/pharmacy-home';
  if (role === 'courier') return '/courier-home';
  if (role === 'admin') return '/admin-home';
  return '/(tabs)';
}

const seed: StoredUser[] = [
  {
    role: 'client',
    id: 'c-awa',
    firstName: 'Awa',
    lastName: 'Diop',
    phone: '+241 77 00 00 00',
    email: 'awa@pharmamarket.ga',
    provider: 'password',
    password: 'demo123',
  },
  { ...demoCentrePharmacy(), password: 'demo123' },
  { ...demoOwendoPharmacy(), password: 'demo123' },
  {
    role: 'admin',
    id: 'a-gpp',
    firstName: 'Nadia',
    lastName: 'Admin',
    phone: '+241 77 00 11 22',
    email: 'admin@gopharmapro.com',
    password: 'demo123',
  },
  {
    ...emptyCourierAccount('d-jean', {
      firstName: 'Jean',
      lastName: 'Mba',
      phone: '+241 66 00 00 00',
      email: 'livreur@gopharmapro.com',
      provider: 'password',
      vehicle: 'moto',
      plate: 'LBV-204-GA',
      payoutPhone: '+241 66 00 00 00',
      province: 'Estuaire',
      city: 'Libreville',
      commune: 'Libreville',
      area: 'Centre-ville',
      zones: 'Centre-ville, Glass, Louis',
      status: 'active',
      documents: emptyCourierDocuments().map((d) => ({ ...d, fileName: d.key + '.pdf', status: 'verified' as const })),
    }),
    password: 'demo123',
  },
  {
    ...emptyCourierAccount('d-paul', {
      firstName: 'Paul',
      lastName: 'Nzé',
      phone: '+241 66 11 22 33',
      email: 'paul.livreur@gopharmapro.com',
      provider: 'password',
      vehicle: 'moto',
      plate: 'LBV-318-GA',
      payoutPhone: '+241 66 11 22 33',
      province: 'Estuaire',
      city: 'Libreville',
      commune: 'Libreville',
      area: 'Owendo',
      zones: 'Owendo, PK8',
      status: 'pending',
      documents: emptyCourierDocuments().map((d) => ({
        ...d,
        fileName: d.required ? d.key + '.pdf' : undefined,
        status: 'pending' as const,
      })),
    }),
    password: 'demo123',
  },
];

let users: StoredUser[] = [...seed];

function stripPassword(user: StoredUser): Session {
  const { password: _password, ...session } = user;
  return session;
}

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('241')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

function findUser(identifier: string, role: UserRole) {
  const id = identifier.trim();
  if (!id) return undefined;
  const phone = normalizePhone(id);
  return users.find((u) => {
    if (u.role !== role) return false;
    if (u.email && u.email.toLowerCase() === id.toLowerCase()) return true;
    return phone.length >= 7 && normalizePhone(u.phone) === phone;
  });
}

function normalizeClient(raw: ClientAccount): ClientAccount {
  return {
    ...raw,
    provider: raw.provider || (raw.googleId ? 'google' : 'password'),
    phone: raw.phone || '',
  };
}

function normalizeCourier(raw: CourierAccount): CourierAccount {
  const base = emptyCourierAccount(raw.id || 'd-' + Date.now());
  return {
    ...base,
    ...raw,
    provider: raw.provider || (raw.googleId ? 'google' : 'password'),
    phone: raw.phone || '',
    vehicle: raw.vehicle || 'moto',
    vehicleOther: raw.vehicleOther || '',
    plate: raw.plate || '',
    payoutPhone: raw.payoutPhone || raw.phone || '',
    province: raw.province || base.province,
    city: raw.city || base.city,
    commune: raw.commune || base.commune,
    area: raw.area || '',
    zones: raw.zones || '',
    documents: raw.documents?.length ? raw.documents : base.documents,
    status: raw.status || 'pending',
  };
}

function normalizePharmacy(raw: PharmacyAccount): PharmacyAccount {
  const fallback = toPharmacyAccount(emptyPharmacyForm(), raw.id, raw.status || 'pending');
  return {
    ...fallback,
    ...raw,
    services: { ...fallback.services, ...raw.services },
    hours: { ...fallback.hours, ...raw.hours },
    documents: raw.documents?.length ? raw.documents : fallback.documents,
    pharmacistName: raw.pharmacistName || `${raw.managerFirstName || ''} ${raw.managerLastName || ''}`.trim(),
  };
}

function toSession(user: StoredUser): Session {
  if (user.role === 'admin') return stripPassword(user) as AdminAccount;
  if (user.role === 'pharmacy') return normalizePharmacy(stripPassword(user) as PharmacyAccount);
  if (user.role === 'courier') return normalizeCourier(stripPassword(user) as CourierAccount);
  return normalizeClient(stripPassword(user) as ClientAccount);
}

function directoryOf() {
  return users.map((u) => toSession(u));
}

function mergeSeed(stored: StoredUser[]) {
  const ids = new Set(stored.map((u) => u.id));
  const emails = new Set(stored.map((u) => (u.email || '').toLowerCase()).filter(Boolean));
  let next = [...stored];
  for (const s of seed) {
    if (ids.has(s.id) || emails.has(s.email.toLowerCase())) continue;
    next = [...next, s];
  }
  return next;
}

async function persist(session: Session | null, guest: boolean) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ session, guest, users }));
}

export const useAuth = create<AuthStore>((set, get) => ({
  hydrated: false,
  session: null,
  guest: false,
  directory: seed.map((u) => toSession(u)),
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { session: Session | null; guest: boolean; users?: StoredUser[] };
        if (parsed.users?.length) {
          users = mergeSeed(
            parsed.users.map((u) => {
              if (u.role === 'pharmacy') return { ...normalizePharmacy(u), password: u.password };
              if (u.role === 'courier') return { ...normalizeCourier(u), password: u.password };
              if (u.role === 'admin') return { ...(stripPassword(u) as AdminAccount), password: u.password };
              return { ...normalizeClient(u), password: u.password };
            }),
          );
        }
        const session =
          parsed.session?.role === 'pharmacy'
            ? normalizePharmacy(parsed.session)
            : parsed.session?.role === 'courier'
              ? normalizeCourier(parsed.session)
              : parsed.session?.role === 'client'
                ? normalizeClient(parsed.session)
                : parsed.session;
        set({ session, guest: parsed.guest, hydrated: true, directory: directoryOf() });
        return;
      }
    } catch {
      // keep seed
    }
    set({ hydrated: true, directory: directoryOf() });
  },
  login: (identifier, password, role) => {
    const user = findUser(identifier, role);
    if (!user || !user.password || user.password !== password) return 'invalid';
    const session = toSession(user);
    set({ session, guest: false, directory: directoryOf() });
    persist(session, false);
    return 'ok';
  },
  registerClient: (input) => {
    if (findUser(input.phone, 'client') || (input.email && findUser(input.email, 'client'))) return 'exists';
    const user: StoredUser = { ...input, role: 'client', id: 'c-' + Date.now(), provider: input.provider || 'password' };
    users = [user, ...users];
    const session = normalizeClient(stripPassword(user) as ClientAccount);
    set({ session, guest: false, directory: directoryOf() });
    persist(session, false);
    return 'ok';
  },
  registerCourier: (input) => {
    if (findUser(input.phone, 'courier') || (input.email && findUser(input.email, 'courier'))) return 'exists';
    const user: StoredUser = {
      ...input,
      role: 'courier',
      id: 'd-' + Date.now(),
      provider: input.provider || 'password',
      status: 'pending',
    };
    users = [user, ...users];
    const session = normalizeCourier(stripPassword(user) as CourierAccount);
    set({ session, guest: false, directory: directoryOf() });
    persist(session, false);
    return 'ok';
  },
  registerPharmacy: (input) => {
    if (findUser(input.phone, 'pharmacy') || findUser(input.email, 'pharmacy')) return 'exists';
    const { password, ...account } = input;
    const user: StoredUser = { ...account, password };
    users = [user, ...users];
    const session = stripPassword(user);
    set({ session, guest: false, directory: directoryOf() });
    persist(session, false);
    return 'ok';
  },
  loginWithGoogle: (profile, role) => {
    if (!profile.email) return 'error';
    const email = profile.email.toLowerCase();
    const other = users.find((u) => u.email && u.email.toLowerCase() === email && u.role !== role);
    if (other) return 'conflict';
    const existing = users.find(
      (u) =>
        u.role === role &&
        ((u.email && u.email.toLowerCase() === email) ||
          ((u.role === 'client' || u.role === 'courier') && u.googleId && u.googleId === profile.googleId)),
    ) as ((ClientAccount | CourierAccount) & { password: string }) | undefined;
    if (existing) {
      const updated: StoredUser =
        existing.role === 'courier'
          ? {
              ...existing,
              googleId: profile.googleId || existing.googleId,
              firstName: existing.firstName || profile.firstName,
              lastName: existing.lastName || profile.lastName,
              email: existing.email || email,
            }
          : {
              ...existing,
              googleId: profile.googleId || existing.googleId,
              firstName: existing.firstName || profile.firstName,
              lastName: existing.lastName || profile.lastName,
              email: existing.email || email,
            };
      users = users.map((u) => (u.id === existing.id ? updated : u));
      const session = toSession(updated);
      set({ session, guest: false, directory: directoryOf() });
      persist(session, false);
      return 'ok';
    }
    const user: StoredUser =
      role === 'courier'
        ? {
            ...emptyCourierAccount('d-google-' + (profile.googleId || Date.now()), {
              firstName: profile.firstName,
              lastName: profile.lastName,
              phone: '',
              email,
              provider: 'google',
              googleId: profile.googleId,
              vehicle: 'moto',
              status: 'pending',
            }),
            password: '',
          }
        : {
            role: 'client',
            id: 'c-google-' + (profile.googleId || Date.now()),
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: '',
            email,
            provider: 'google',
            googleId: profile.googleId,
            password: '',
          };
    users = [user, ...users];
    const session = toSession(user);
    set({ session, guest: false, directory: directoryOf() });
    persist(session, false);
    return 'ok';
  },
  continueAsGuest: () => {
    set({ guest: true, session: null, directory: directoryOf() });
    persist(null, true);
  },
  logout: () => {
    set({ session: null, guest: false, directory: directoryOf() });
    persist(null, false);
  },
  setPharmacyStatus: (id, status) => {
    users = users.map((u) =>
      u.role === 'pharmacy' && u.id === id
        ? {
            ...u,
            status,
            visibleOnMarketplace: status === 'verified',
            documents:
              status === 'verified'
                ? u.documents.map((d) => (d.fileName && d.required ? { ...d, status: 'verified' as const } : d))
                : u.documents,
          }
        : u,
    );
    set({ directory: directoryOf() });
    persist(get().session, get().guest);
  },
  setCourierStatus: (id, status) => {
    users = users.map((u) =>
      u.role === 'courier' && u.id === id
        ? {
            ...u,
            status,
            documents:
              status === 'active'
                ? u.documents.map((d) => (d.fileName && d.required ? { ...d, status: 'verified' as const } : d))
                : u.documents,
          }
        : u,
    );
    set({ directory: directoryOf() });
    persist(get().session, get().guest);
  },
  setDocumentStatus: (accountId, docKey, status) => {
    users = users.map((u) => {
      if (u.id !== accountId || (u.role !== 'pharmacy' && u.role !== 'courier')) return u;
      return {
        ...u,
        documents: u.documents.map((d) => (d.key === docKey ? { ...d, status } : d)),
      };
    });
    set({ directory: directoryOf() });
    persist(get().session, get().guest);
  },
}));
