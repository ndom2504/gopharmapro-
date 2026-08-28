import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ClientAccount, PharmacyAccount, Session, UserRole } from '../types';
import { demoCentrePharmacy, emptyPharmacyForm, toPharmacyAccount } from '../pharmacy-onboarding/defaults';
import { GoogleProfile } from '../lib/google';

const KEY = 'pharmarket-auth-v1';

type StoredUser = (ClientAccount | PharmacyAccount) & { password: string };

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
  registerPharmacy: (input: PharmacyAccount & { password: string }) => 'ok' | 'exists';
  loginWithGoogle: (profile: GoogleProfile) => 'ok' | 'pharmacy' | 'error';
  continueAsGuest: () => void;
  logout: () => void;
};

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

async function persist(session: Session | null, guest: boolean) {
  await AsyncStorage.setItem(KEY, JSON.stringify({ session, guest, users }));
}

export const useAuth = create<AuthStore>((set) => ({
  hydrated: false,
  session: null,
  guest: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { session: Session | null; guest: boolean; users?: StoredUser[] };
        if (parsed.users?.length) {
          users = parsed.users.map((u) =>
            u.role === 'pharmacy'
              ? { ...normalizePharmacy(u), password: u.password }
              : { ...normalizeClient(u), password: u.password },
          );
        }
        const session =
          parsed.session?.role === 'pharmacy'
            ? normalizePharmacy(parsed.session)
            : parsed.session?.role === 'client'
              ? normalizeClient(parsed.session)
              : parsed.session;
        set({ session, guest: parsed.guest, hydrated: true });
        return;
      }
    } catch {
      // keep seed
    }
    set({ hydrated: true });
  },
  login: (identifier, password, role) => {
    const user = findUser(identifier, role);
    if (!user || !user.password || user.password !== password) return 'invalid';
    const session =
      user.role === 'pharmacy'
        ? normalizePharmacy(stripPassword(user) as PharmacyAccount)
        : normalizeClient(stripPassword(user) as ClientAccount);
    set({ session, guest: false });
    persist(session, false);
    return 'ok';
  },
  registerClient: (input) => {
    if (findUser(input.phone, 'client') || (input.email && findUser(input.email, 'client'))) return 'exists';
    const user: StoredUser = { ...input, role: 'client', id: 'c-' + Date.now(), provider: input.provider || 'password' };
    users = [user, ...users];
    const session = normalizeClient(stripPassword(user) as ClientAccount);
    set({ session, guest: false });
    persist(session, false);
    return 'ok';
  },
  registerPharmacy: (input) => {
    if (findUser(input.phone, 'pharmacy') || findUser(input.email, 'pharmacy')) return 'exists';
    const { password, ...account } = input;
    const user: StoredUser = { ...account, password };
    users = [user, ...users];
    const session = stripPassword(user);
    set({ session, guest: false });
    persist(session, false);
    return 'ok';
  },
  loginWithGoogle: (profile) => {
    if (!profile.email) return 'error';
    const email = profile.email.toLowerCase();
    if (users.some((u) => u.role === 'pharmacy' && u.email.toLowerCase() === email)) return 'pharmacy';
    const existing = users.find(
      (u) =>
        u.role === 'client' &&
        ((u.email && u.email.toLowerCase() === email) || (u.googleId && u.googleId === profile.googleId)),
    ) as (ClientAccount & { password: string }) | undefined;
    if (existing) {
      const updated: StoredUser = {
        ...existing,
        googleId: profile.googleId || existing.googleId,
        firstName: existing.firstName || profile.firstName,
        lastName: existing.lastName || profile.lastName,
        email: existing.email || email,
      };
      users = users.map((u) => (u.id === existing.id ? updated : u));
      const session = normalizeClient(stripPassword(updated) as ClientAccount);
      set({ session, guest: false });
      persist(session, false);
      return 'ok';
    }
    const user: StoredUser = {
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
    const session = normalizeClient(stripPassword(user) as ClientAccount);
    set({ session, guest: false });
    persist(session, false);
    return 'ok';
  },
  continueAsGuest: () => {
    set({ guest: true, session: null });
    persist(null, true);
  },
  logout: () => {
    set({ session: null, guest: false });
    persist(null, false);
  },
}));
