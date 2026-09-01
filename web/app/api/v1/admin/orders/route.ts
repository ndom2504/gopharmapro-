import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { listAdminOrders } from '@/lib/orders/access';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminSession())) return unauthorized();
  try {
    return NextResponse.json({ ok: true, orders: await listAdminOrders() });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
