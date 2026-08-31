import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogErrorResponse, unauthorized } from '@/lib/catalog/http';
import { adminCreateCategory } from '@/lib/catalog/queries';
import { assertCategoryInput } from '@/lib/catalog/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdminSession())) return unauthorized();
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const input = assertCategoryInput(body);
    const category = await adminCreateCategory({
      countryId: input.countryId!,
      name: input.name!,
      slug: input.slug,
      description: input.description,
      active: input.active,
      sortOrder: input.sortOrder,
    });
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
