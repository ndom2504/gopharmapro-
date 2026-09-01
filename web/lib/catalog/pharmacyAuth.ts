import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogDb } from '@/lib/prisma';
import { CatalogError } from './validations';

export const PHARMACY_COOKIE = 'gpp_pharmacy';

function secret() {
  return process.env.CATALOG_API_SECRET || process.env.ADMIN_PASSWORD || 'unset';
}

export function pharmacyToken(pharmacyId: string) {
  return createHmac('sha256', secret()).update(`gopharmapro-pharmacy-v1:${pharmacyId}`).digest('hex');
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function resolvePharmacy(pharmacyKey: string) {
  const db = catalogDb();
  const key = pharmacyKey.trim();
  const row = await db.pharmacy.findFirst({
    where: { OR: [{ id: key }, { accountId: key }] },
  });
  if (!row) throw new CatalogError(404, 'Pharmacie introuvable.');
  return row;
}

function parsePharmacyCookie(value: string) {
  const dot = value.lastIndexOf('.');
  if (dot < 1) return { id: null as string | null, token: value };
  return { id: value.slice(0, dot), token: value.slice(dot + 1) };
}

export async function requirePharmacyMatch(pharmacyKey: string) {
  const pharmacy = await resolvePharmacy(pharmacyKey);
  if (await isAdminSession()) return pharmacy;
  const jar = await cookies();
  const value = jar.get(PHARMACY_COOKIE)?.value || '';
  const parsed = parsePharmacyCookie(value);
  const tokenOk = parsed.token && same(parsed.token, pharmacyToken(pharmacy.id));
  const legacyOk = Boolean(value) && same(value, pharmacyToken(pharmacy.id));
  if (!tokenOk && !legacyOk) {
    throw new CatalogError(401, 'Pharmacie non authentifiée.');
  }
  return pharmacy;
}

export async function requirePharmacySession() {
  const jar = await cookies();
  const value = jar.get(PHARMACY_COOKIE)?.value || '';
  const parsed = parsePharmacyCookie(value);
  if (!parsed.id || !same(parsed.token, pharmacyToken(parsed.id))) {
    throw new CatalogError(401, 'Pharmacie non authentifiée.');
  }
  return resolvePharmacy(parsed.id);
}

export async function resolveActingPharmacy(req?: Request, bodyPharmacyId?: string | null) {
  const fromQuery = req ? new URL(req.url).searchParams.get('pharmacyId') : null;
  const key = String(bodyPharmacyId || fromQuery || '').trim();
  if (await isAdminSession()) {
    if (!key) throw new CatalogError(400, 'pharmacyId requis.');
    return resolvePharmacy(key);
  }
  if (key) return requirePharmacyMatch(key);
  return requirePharmacySession();
}

export async function canAccessPharmacy(pharmacyKey: string) {
  try {
    await requirePharmacyMatch(pharmacyKey);
    return true;
  } catch {
    return false;
  }
}

export async function setPharmacyCookie(pharmacyId: string) {
  const jar = await cookies();
  jar.set(PHARMACY_COOKIE, `${pharmacyId}.${pharmacyToken(pharmacyId)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}
