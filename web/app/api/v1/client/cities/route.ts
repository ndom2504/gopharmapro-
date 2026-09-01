import { NextResponse } from 'next/server';
import { citiesForSearch } from '@/lib/client/cities';
import { CatalogError, parseCountryCode } from '@/lib/catalog/validations';
import { catalogErrorResponse } from '@/lib/catalog/http';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const country = new URL(req.url).searchParams.get('country') || 'GA';
    if (!parseCountryCode(country)) throw new CatalogError(400, 'Code pays invalide.');
    return NextResponse.json({ country: country.toUpperCase(), cities: citiesForSearch(country) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
