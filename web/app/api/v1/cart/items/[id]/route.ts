import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requireClientProfile } from '@/lib/client/auth';
import { removeCartItem, updateCartItem } from '@/lib/orders/cart';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireClientProfile();
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { quantity?: number };
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity)) throw new CatalogError(400, 'Quantité invalide.');
    return NextResponse.json({ ok: true, cart: await updateCartItem(profile.id, id, quantity) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireClientProfile();
    const { id } = await params;
    return NextResponse.json({ ok: true, cart: await removeCartItem(profile.id, id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
