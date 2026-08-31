import { NextResponse } from 'next/server';
import { listCategories } from '@/lib/catalog/queries';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const country = new URL(req.url).searchParams.get('country');
    if (!country) throw new CatalogError(400, 'Paramètre country requis.');
    const categories = await listCategories(country);
    return NextResponse.json({ country: country.toUpperCase(), categories });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
