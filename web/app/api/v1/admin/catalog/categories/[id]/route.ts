import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { adminPatchCategory } from '@/lib/catalog/queries';
import { assertCategoryInput } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertCategoryInput(body, true);
    const category = await adminPatchCategory(id, {
      ...(input.name != null ? { name: input.name } : {}),
      ...(input.slug ? { slug: input.slug } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });
    return NextResponse.json({ ok: true, category });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
