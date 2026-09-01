import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { resolveActingPharmacy } from '@/lib/catalog/pharmacyAuth';
import { getPharmacyOrder } from '@/lib/orders/access';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const pharmacy = await resolveActingPharmacy(req);
    const { id } = await params;
    return NextResponse.json({ ok: true, order: await getPharmacyOrder(pharmacy.id, id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
