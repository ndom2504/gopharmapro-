import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { resolveActingPharmacy } from '@/lib/catalog/pharmacyAuth';
import { reviewOrderPrescription } from '@/lib/orders/prescription';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = (await req.json().catch(() => ({}))) as { pharmacyId?: string; note?: string };
    const pharmacy = await resolveActingPharmacy(req, body.pharmacyId);
    const { id } = await params;
    return NextResponse.json({
      ok: true,
      order: await reviewOrderPrescription(pharmacy.id, id, 'approve', body.note, pharmacy.accountId || pharmacy.id),
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
