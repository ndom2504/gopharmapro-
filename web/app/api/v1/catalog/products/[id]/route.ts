import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { deactivateCatalogProduct, getProduct, serializeProduct, updateCatalogProduct } from '@/lib/catalog/queries';
import { assertProductInput, CatalogError } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const country = new URL(req.url).searchParams.get('country');
    const product = await getProduct(id, country);
    return NextResponse.json({ product });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertProductInput(body, true);
    const countryCode = String(body.country || body.countryCode || '').trim() || undefined;
    const product = await updateCatalogProduct(id, {
      name: input.name,
      genericName: input.genericName,
      brandName: input.brandName,
      description: input.description,
      dosage: input.dosage,
      pharmaceuticalForm: input.pharmaceuticalForm,
      categoryId: input.categoryId,
      requiresPrescription: input.requiresPrescription,
      active: input.active,
      countryCode,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
    });
    const country =
      countryCode?.toUpperCase() ||
      product.countryStatuses[0]?.country.code ||
      '';
    if (!country) throw new CatalogError(400, 'Pays requis.');
    return NextResponse.json({ ok: true, product: serializeProduct(product, country) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const { id } = await params;
    const product = await deactivateCatalogProduct(id);
    const country = product.countryStatuses[0]?.country.code || '';
    return NextResponse.json({
      ok: true,
      product: country ? serializeProduct(product, country) : { id: product.id, active: product.active },
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
