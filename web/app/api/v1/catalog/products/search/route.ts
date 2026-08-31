import { NextResponse } from 'next/server';
import { searchProducts } from '@/lib/catalog/queries';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError, parseLimit, parsePage } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const query = q.get('q') || q.get('search') || '';
    const country = q.get('country');
    if (!country) throw new CatalogError(400, 'Paramètre country requis.');
    if (!query.trim()) throw new CatalogError(400, 'Paramètre q requis.');
    const data = await searchProducts({
      q: query,
      country,
      category: q.get('category'),
      page: parsePage(q.get('page')),
      limit: parseLimit(q.get('limit')),
    });
    return NextResponse.json(data);
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
