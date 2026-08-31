import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { adminUpsertProductCountry } from '@/lib/catalog/queries';
import { CatalogError, parseStatus } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const productId = String(body.productId || '').trim();
    const countryId = String(body.countryId || '').trim();
    if (!productId || !countryId) throw new CatalogError(400, 'productId et countryId requis.');
    const status = body.status == null ? undefined : parseStatus(body.status);
    if (body.status != null && !status) throw new CatalogError(400, 'Statut réglementaire invalide.');
    const row = await adminUpsertProductCountry({
      productId,
      countryId,
      status: status || undefined,
      requiresPrescription: body.requiresPrescription == null ? undefined : Boolean(body.requiresPrescription),
      regulatoryReference: body.regulatoryReference == null ? null : String(body.regulatoryReference),
      regulatoryNote: body.regulatoryNote == null ? null : String(body.regulatoryNote),
      verified: Boolean(body.verified),
    });
    return NextResponse.json({ ok: true, productCountry: row });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
