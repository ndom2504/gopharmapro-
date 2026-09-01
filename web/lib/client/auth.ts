import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogDb } from '@/lib/prisma';
import { CatalogError, parseCountryCode } from '@/lib/catalog/validations';

export const CLIENT_COOKIE = 'gpp_client';

function secret() {
  return process.env.CATALOG_API_SECRET || process.env.ADMIN_PASSWORD || 'unset';
}

export function clientToken(accountId: string) {
  return createHmac('sha256', secret()).update(`gopharmapro-client-v1:${accountId}`).digest('hex');
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function setClientCookie(accountId: string) {
  const jar = await cookies();
  jar.set(CLIENT_COOKIE, `${accountId}.${clientToken(accountId)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function readClientAccountId() {
  const value = (await cookies()).get(CLIENT_COOKIE)?.value || '';
  const dot = value.indexOf('.');
  if (dot < 1) return null;
  const accountId = value.slice(0, dot);
  const token = value.slice(dot + 1);
  if (!same(token, clientToken(accountId))) return null;
  return accountId;
}

export async function requireClientProfile() {
  const accountId = await readClientAccountId();
  if (!accountId) throw new CatalogError(401, 'Client non authentifié.');
  const profile = await catalogDb().customerProfile.findUnique({
    where: { accountId },
    include: { country: true },
  });
  if (!profile) throw new CatalogError(401, 'Profil client introuvable.');
  return profile;
}

export async function upsertClientProfile(input: {
  accountId: string;
  country?: string | null;
  city?: string | null;
  address?: string | null;
}) {
  const db = catalogDb();
  const existing = await db.customerProfile.findUnique({
    where: { accountId: input.accountId },
    include: { country: true },
  });
  const code = parseCountryCode(input.country) || existing?.country.code || 'GA';
  const country = await db.country.findUnique({ where: { code } });
  if (!country) throw new CatalogError(400, 'Pays inexistant.');
  return db.customerProfile.upsert({
    where: { accountId: input.accountId },
    update: {
      countryId: country.id,
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
    },
    create: {
      accountId: input.accountId,
      countryId: country.id,
      city: input.city,
      address: input.address,
    },
    include: { country: true },
  });
}

export async function isPrivileged() {
  return isAdminSession();
}
