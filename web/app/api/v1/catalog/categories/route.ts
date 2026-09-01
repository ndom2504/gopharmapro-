import { NextResponse } from 'next/server';
import { listCategories } from '@/lib/catalog/queries';
import { catalogErrorResponse } from '@/lib/catalog/http';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const country = new URL(req.url).searchParams.get('country');
    const categories = await listCategories(country);
    return NextResponse.json({
      country: country ? country.toUpperCase() : null,
      categories,
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
