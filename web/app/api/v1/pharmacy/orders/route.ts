import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { resolveActingPharmacy } from '@/lib/catalog/pharmacyAuth';
import { listPharmacyOrders } from '@/lib/orders/access';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const pharmacy = await resolveActingPharmacy(req);
    return NextResponse.json({ ok: true, orders: await listPharmacyOrders(pharmacy.id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
