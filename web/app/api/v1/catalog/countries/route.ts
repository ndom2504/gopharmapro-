import { NextResponse } from 'next/server';
import { getActiveCountries } from '@/lib/catalog/queries';
import { catalogErrorResponse } from '@/lib/catalog/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const countries = await getActiveCountries();
    return NextResponse.json({ countries });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
