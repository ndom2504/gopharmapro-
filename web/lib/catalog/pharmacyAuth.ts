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

export async function requirePharmacyMatch(pharmacyKey: string) {
  const pharmacy = await resolvePharmacy(pharmacyKey);
  if (await isAdminSession()) return pharmacy;
  const jar = await cookies();
  const value = jar.get(PHARMACY_COOKIE)?.value || '';
  if (!value || !same(value, pharmacyToken(pharmacy.id))) {
    throw new CatalogError(401, 'Pharmacie non authentifiée.');
  }
  return pharmacy;
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
  jar.set(PHARMACY_COOKIE, pharmacyToken(pharmacyId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}
