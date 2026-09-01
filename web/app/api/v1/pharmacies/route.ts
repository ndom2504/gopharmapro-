import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { assertPharmacyInput, createPharmacy, listPharmacies, serializePharmacy } from '@/lib/catalog/pharmacyQueries';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const country = new URL(req.url).searchParams.get('country');
    const admin = await isAdminSession();
    const rows = await listPharmacies({ country, includeInactive: admin });
    return NextResponse.json({
      pharmacies: rows.map((row) => serializePharmacy(row, { includeContact: admin })),
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertPharmacyInput(body);
    const pharmacy = await createPharmacy(input);
    return NextResponse.json({ ok: true, pharmacy: serializePharmacy(pharmacy, { includeContact: true }) }, { status: 201 });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
