import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { getClientOffer } from '@/lib/client/search';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ pharmacyId: string; productId: string }> }) {
  try {
    const { pharmacyId, productId } = await params;
    const offer = await getClientOffer(pharmacyId, productId);
    return NextResponse.json(offer);
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
