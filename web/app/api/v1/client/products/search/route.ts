import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError, parseCoord } from '@/lib/catalog/validations';
import { searchClientOffers, type ClientSort } from '@/lib/client/search';

export const dynamic = 'force-dynamic';

const sorts: ClientSort[] = ['relevance', 'price', 'nearest', 'availability'];

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const country = q.get('country');
    if (!country) throw new CatalogError(400, 'Paramètre country requis.');
    const sort = (q.get('sort') || 'relevance') as ClientSort;
    if (!sorts.includes(sort)) throw new CatalogError(400, 'Tri invalide.');
    const data = await searchClientOffers({
      country,
      search: q.get('search'),
      category: q.get('category'),
      city: q.get('city'),
      latitude: parseCoord(q.get('latitude')),
      longitude: parseCoord(q.get('longitude')),
      sort,
    });
    return NextResponse.json(data);
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
