import { NextResponse } from 'next/server';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { requirePharmacyMatch } from '@/lib/catalog/pharmacyAuth';
import { deletePharmacyOffer, patchPharmacyOffer } from '@/lib/catalog/queries';
import { CatalogError, assertOfferPatch } from '@/lib/catalog/validations';
import { isAdminSession } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ pharmacyId: string; productId: string }> }) {
  try {
    const { pharmacyId, productId } = await params;
    const pharmacy = await requirePharmacyMatch(pharmacyId);
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const patch = assertOfferPatch(body);
    const offer = await patchPharmacyOffer(pharmacy.id, productId, patch);
    return NextResponse.json({ ok: true, offer: { ...offer, price: Number(offer.price) } });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401 && !(await isAdminSession())) return unauthorized();
    return catalogErrorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ pharmacyId: string; productId: string }> }) {
  try {
    const { pharmacyId, productId } = await params;
    const pharmacy = await requirePharmacyMatch(pharmacyId);
    await deletePharmacyOffer(pharmacy.id, productId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401 && !(await isAdminSession())) return unauthorized();
    return catalogErrorResponse(err);
  }
}
