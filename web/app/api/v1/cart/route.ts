import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { requireClientProfile } from '@/lib/client/auth';
import { clearCart, serializeCart } from '@/lib/orders/cart';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await requireClientProfile();
    return NextResponse.json({ ok: true, cart: await serializeCart(profile.id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function DELETE() {
  try {
    const profile = await requireClientProfile();
    return NextResponse.json({ ok: true, cart: await clearCart(profile.id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
