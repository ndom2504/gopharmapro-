import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { createCatalogProduct, listProducts, serializeProduct } from '@/lib/catalog/queries';
import { assertProductInput, CatalogError, parseBool, parseLimit, parsePage } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const q = new URL(req.url).searchParams;
    const country = q.get('country');
    if (!country) throw new CatalogError(400, 'Paramètre country requis.');
    const admin = await isAdminSession();
    const includeInactive = admin && q.get('includeInactive') !== '0';
    const data = await listProducts({
      country,
      category: q.get('category'),
      search: q.get('search'),
      page: parsePage(q.get('page')),
      limit: parseLimit(q.get('limit'), includeInactive ? 50 : 20, includeInactive ? 100 : 50),
      prescriptionRequired: parseBool(q.get('prescriptionRequired') ?? q.get('requiresPrescription')),
      active: admin ? parseBool(q.get('active')) : undefined,
      includeInactive,
    });
    return NextResponse.json(data);
  } catch (err) {
    return catalogErrorResponse(err);
  }
}

export async function POST(req: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertProductInput(body);
    const countryCode = String(body.country || body.countryCode || '').trim();
    if (!countryCode) throw new CatalogError(400, 'Pays requis.');
    const product = await createCatalogProduct({
      name: input.name!,
      categoryId: input.categoryId!,
      countryCode,
      genericName: input.genericName,
      brandName: input.brandName,
      description: input.description,
      dosage: input.dosage,
      pharmaceuticalForm: input.pharmaceuticalForm,
      requiresPrescription: input.requiresPrescription,
    });
    return NextResponse.json(
      {
        ok: true,
        product: serializeProduct(product, countryCode.toUpperCase()),
        message: 'Statut réglementaire : À vérifier. La création n’autorise pas le médicament.',
      },
      { status: 201 },
    );
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
