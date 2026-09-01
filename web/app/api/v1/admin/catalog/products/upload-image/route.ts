import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { uploadProductImage } from '@/lib/catalog/blob';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new CatalogError(400, 'Fichier image requis.');
    const uploaded = await uploadProductImage(file);
    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      imageUrl: uploaded.url,
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
