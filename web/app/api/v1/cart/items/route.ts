import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requireClientProfile } from '@/lib/client/auth';
import { addCartItem } from '@/lib/orders/cart';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const profile = await requireClientProfile();
    const body = (await req.json().catch(() => ({}))) as { pharmacyProductId?: string; quantity?: number };
    const pharmacyProductId = String(body.pharmacyProductId || '').trim();
    if (!pharmacyProductId) throw new CatalogError(400, 'pharmacyProductId requis.');
    const quantity = Number(body.quantity ?? 1);
    const cart = await addCartItem(profile.id, pharmacyProductId, quantity);
    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
