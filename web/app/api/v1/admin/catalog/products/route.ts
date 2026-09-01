import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { adminCreateProduct } from '@/lib/catalog/queries';
import { assertProductInput } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertProductInput(body);
    const product = await adminCreateProduct({
      categoryId: input.categoryId!,
      name: input.name!,
      slug: input.slug,
      genericName: input.genericName,
      brandName: input.brandName,
      activeIngredient: input.activeIngredient,
      dosage: input.dosage,
      dosageUnit: input.dosageUnit,
      pharmaceuticalForm: input.pharmaceuticalForm,
      packaging: input.packaging,
      description: input.description,
      requiresPrescription: input.requiresPrescription,
      imageUrl: input.imageUrl,
      imageAlt: input.imageAlt,
      active: input.active,
    });
    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
