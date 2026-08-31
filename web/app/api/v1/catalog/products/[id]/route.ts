import { NextResponse } from 'next/server';
import { getProduct } from '@/lib/catalog/queries';
import { catalogErrorResponse } from '@/lib/catalog/http';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const country = new URL(req.url).searchParams.get('country');
    const product = await getProduct(id, country);
    return NextResponse.json({ product });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
