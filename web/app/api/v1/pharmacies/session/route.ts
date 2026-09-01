import { NextResponse } from 'next/server';
import { catalogDb } from '@/lib/prisma';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { setPharmacyCookie } from '@/lib/catalog/pharmacyAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { accountId?: string; email?: string };
    const accountId = String(body.accountId || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    if (!accountId && !email) throw new CatalogError(400, 'accountId ou email requis.');
    const pharmacy = await catalogDb().pharmacy.findFirst({
      where: {
        active: true,
        OR: [...(accountId ? [{ accountId }] : []), ...(email ? [{ email: { equals: email, mode: 'insensitive' as const } }] : [])],
      },
      include: { country: true },
    });
    if (!pharmacy) throw new CatalogError(401, 'Pharmacie absente du catalogue central.');
    await setPharmacyCookie(pharmacy.id);
    return NextResponse.json({
      ok: true,
      pharmacy: {
        id: pharmacy.id,
        accountId: pharmacy.accountId,
        name: pharmacy.name,
        legalName: pharmacy.legalName,
        city: pharmacy.city,
        countryId: pharmacy.countryId,
        country: {
          id: pharmacy.country.id,
          code: pharmacy.country.code,
          name: pharmacy.country.name,
          currency: pharmacy.country.currency,
          currencySymbol: pharmacy.country.currencySymbol,
        },
      },
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
