import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { requireClientProfile } from '@/lib/client/auth';
import { cancelCustomerOrder } from '@/lib/orders/access';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireClientProfile();
    const { id } = await params;
    return NextResponse.json({ ok: true, order: await cancelCustomerOrder(profile.id, id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
