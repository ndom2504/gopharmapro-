import { NextResponse } from 'next/server';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { reviewPrescription, serializePrescription } from '@/lib/client/prescriptions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { pharmacyId?: string };
    if (!body.pharmacyId) throw new CatalogError(400, 'pharmacyId requis.');
    const row = await reviewPrescription(id, String(body.pharmacyId), 'approve');
    return NextResponse.json({ ok: true, prescription: serializePrescription(row) });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401) return unauthorized();
    return catalogErrorResponse(err);
  }
}
