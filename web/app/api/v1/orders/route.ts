import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { requireClientProfile } from '@/lib/client/auth';
import { listAdminOrders, listCustomerOrders } from '@/lib/orders/access';
import { createOrdersFromCart } from '@/lib/orders/checkout';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (await isAdminSession()) {
      return NextResponse.json({ ok: true, orders: await listAdminOrders() });
    }
    const profile = await requireClientProfile();
    return NextResponse.json({ ok: true, orders: await listCustomerOrders(profile.id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const profile = await requireClientProfile();
    const body = (await req.json().catch(() => ({}))) as {
      fulfillmentByPharmacy?: Record<string, unknown>;
      fulfillmentMethod?: unknown;
      deliveryAddress?: string | null;
      deliveryCity?: string | null;
      deliveryLatitude?: number | null;
      deliveryLongitude?: number | null;
      deliveryPhone?: string | null;
      notes?: string | null;
      useSavedAddress?: boolean;
    };
    const orders = await createOrdersFromCart(profile, {
      fulfillmentByPharmacy: body.fulfillmentByPharmacy,
      fulfillmentMethod: body.fulfillmentMethod,
      deliveryAddress: body.deliveryAddress,
      deliveryCity: body.deliveryCity,
      deliveryLatitude: body.deliveryLatitude == null ? null : Number(body.deliveryLatitude),
      deliveryLongitude: body.deliveryLongitude == null ? null : Number(body.deliveryLongitude),
      deliveryPhone: body.deliveryPhone,
      notes: body.notes,
      useSavedAddress: body.useSavedAddress !== false,
    });
    return NextResponse.json({ ok: true, orders });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
