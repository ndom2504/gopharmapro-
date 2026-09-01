import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requirePharmacyMatch } from '@/lib/catalog/pharmacyAuth';
import { requireClientProfile } from '@/lib/client/auth';
import { createPrescription, listPrescriptionsForCustomer, listPrescriptionsForPharmacy, serializePrescription } from '@/lib/client/prescriptions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    if (await isAdminSession()) {
      const pharmacyId = new URL(req.url).searchParams.get('pharmacyId');
      if (!pharmacyId) throw new CatalogError(400, 'pharmacyId requis pour l’admin.');
      const rows = await listPrescriptionsForPharmacy(pharmacyId);
      return NextResponse.json({ prescriptions: rows.map(serializePrescription) });
    }
    const pharmacyId = new URL(req.url).searchParams.get('pharmacyId');
    if (pharmacyId) {
      const pharmacy = await requirePharmacyMatch(pharmacyId);
      const rows = await listPrescriptionsForPharmacy(pharmacy.id);
      return NextResponse.json({ prescriptions: rows.map(serializePrescription) });
    }
    const profile = await requireClientProfile();
    const rows = await listPrescriptionsForCustomer(profile.id);
    return NextResponse.json({ prescriptions: rows.map(serializePrescription) });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401) return unauthorized();
    return catalogErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const profile = await requireClientProfile();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const pharmacyId = String(body.pharmacyId || '').trim();
    const productId = String(body.productId || '').trim();
    if (!pharmacyId || !productId) throw new CatalogError(400, 'pharmacyId et productId requis.');
    const row = await createPrescription({
      customer: profile,
      pharmacyId,
      productId,
      quantity: body.quantity == null ? undefined : Number(body.quantity),
      documentUrl: body.documentUrl == null ? null : String(body.documentUrl),
    });
    return NextResponse.json({ ok: true, prescription: serializePrescription(row) }, { status: 201 });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401) return unauthorized();
    return catalogErrorResponse(err);
  }
}
