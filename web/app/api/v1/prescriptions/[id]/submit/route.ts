import { NextResponse } from 'next/server';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requireClientProfile } from '@/lib/client/auth';
import { serializePrescription, submitPrescription } from '@/lib/client/prescriptions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireClientProfile();
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { documentUrl?: string };
    const row = await submitPrescription(id, profile.id, String(body.documentUrl || ''));
    return NextResponse.json({ ok: true, prescription: serializePrescription(row) });
  } catch (err) {
    if (err instanceof CatalogError && err.status === 401) return unauthorized();
    return catalogErrorResponse(err);
  }
}
