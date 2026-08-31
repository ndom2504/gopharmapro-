import { NextResponse } from 'next/server';
import { listProductPharmacies } from '@/lib/catalog/queries';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { parseBool, parseCoord, parseLimit, parsePage, parseRadiusKm } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const q = new URL(req.url).searchParams;
    const data = await listProductPharmacies({
      productKey: id,
      country: q.get('country'),
      city: q.get('city'),
      latitude: parseCoord(q.get('latitude')),
      longitude: parseCoord(q.get('longitude')),
      radiusKm: parseRadiusKm(q.get('radius')),
      delivery: parseBool(q.get('delivery')),
      pickup: parseBool(q.get('pickup')),
      page: parsePage(q.get('page')),
      limit: parseLimit(q.get('limit')),
    });
    return NextResponse.json(data);
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
