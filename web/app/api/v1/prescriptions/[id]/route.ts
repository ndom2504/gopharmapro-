import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requirePharmacyMatch } from '@/lib/catalog/pharmacyAuth';
import { requireClientProfile } from '@/lib/client/auth';
import { getPrescriptionForActor, serializePrescription } from '@/lib/client/prescriptions';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (await isAdminSession()) {
      const row = await getPrescriptionForActor(id, { admin: true });
      return NextResponse.json({ prescription: serializePrescription(row) });
    }
    const pharmacyId = new URL(req.url).searchParams.get('pharmacyId');
    if (pharmacyId) {
      const pharmacy = await requirePharmacyMatch(pharmacyId);
      const row = await getPrescriptionForActor(id, { pharmacyId: pharmacy.id });
      return NextResponse.json({ prescription: serializePrescription(row) });
    }
    const profile = await requireClientProfile();
    const row = await getPrescriptionForActor(id, { customerId: profile.id });
    return NextResponse.json({ prescription: serializePrescription(row) });
  } catch (err) {
    if (err instanceof CatalogError && (err.status === 401 || err.status === 403)) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return catalogErrorResponse(err);
  }
}
