import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requireClientProfile } from '@/lib/client/auth';
import { attachOrderPrescription } from '@/lib/orders/prescription';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profile = await requireClientProfile();
    const { id } = await params;
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new CatalogError(400, 'Fichier ordonnance requis.');
    return NextResponse.json({ ok: true, order: await attachOrderPrescription(profile.id, id, file) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
