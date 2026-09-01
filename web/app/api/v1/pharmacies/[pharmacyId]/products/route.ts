import { NextResponse } from 'next/server';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { requirePharmacyMatch } from '@/lib/catalog/pharmacyAuth';
import { listPharmacyOffers, serializePharmacyOffer } from '@/lib/catalog/pharmacyQueries';
import { addPharmacyOffer } from '@/lib/catalog/queries';
import { CatalogError, assertOfferInput } from '@/lib/catalog/validations';
import { isAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ pharmacyId: string }> }) {
  try {
    const { pharmacyId } = await params;
    const pharmacy = await requirePharmacyMatch(pharmacyId);
    const offers = await listPharmacyOffers(pharmacy.id);
    return NextResponse.json({
      pharmacy: { id: pharmacy.id, name: pharmacy.name, accountId: pharmacy.accountId },
      offers: offers.map(serializePharmacyOffer),
    });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401 && !(await isAdminSession())) return unauthorized();
    return catalogErrorResponse(err);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ pharmacyId: string }> }) {
  try {
    const { pharmacyId } = await params;
    const pharmacy = await requirePharmacyMatch(pharmacyId);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertOfferInput(body);
    const offer = await addPharmacyOffer(pharmacy.id, input);
    return NextResponse.json({ ok: true, offer: { ...offer, price: Number(offer.price) } }, { status: 201 });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401 && !(await isAdminSession())) return unauthorized();
    return catalogErrorResponse(err);
  }
}
