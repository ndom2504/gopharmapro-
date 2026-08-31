import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { adminPatchProduct } from '@/lib/catalog/queries';
import { assertProductInput } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertProductInput(body, true);
    const product = await adminPatchProduct(id, {
      ...(input.categoryId ? { category: { connect: { id: input.categoryId } } } : {}),
      ...(input.name != null ? { name: input.name } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      ...(input.genericName !== undefined ? { genericName: input.genericName } : {}),
      ...(input.brandName !== undefined ? { brandName: input.brandName } : {}),
      ...(input.activeIngredient !== undefined ? { activeIngredient: input.activeIngredient } : {}),
      ...(input.dosage !== undefined ? { dosage: input.dosage } : {}),
      ...(input.dosageUnit !== undefined ? { dosageUnit: input.dosageUnit } : {}),
      ...(input.pharmaceuticalForm !== undefined ? { pharmaceuticalForm: input.pharmaceuticalForm } : {}),
      ...(input.packaging !== undefined ? { packaging: input.packaging } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.requiresPrescription !== undefined ? { requiresPrescription: input.requiresPrescription } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
