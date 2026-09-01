import { NextResponse } from 'next/server';
import { isAdminSession } from '@/lib/adminAuth';
import { catalogDb } from '@/lib/prisma';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { CatalogError } from '@/lib/catalog/validations';
import { requireClientProfile } from '@/lib/client/auth';
import { getCustomerOrder } from '@/lib/orders/access';
import { serializeOrder } from '@/lib/orders/serialize';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (await isAdminSession()) {
      const row = await catalogDb().order.findFirst({
        where: { OR: [{ id }, { orderNumber: id }] },
        include: {
          pharmacy: true,
          customer: true,
          items: { include: { product: true }, orderBy: { createdAt: 'asc' } },
          prescription: true,
        },
      });
      if (!row) throw new CatalogError(404, 'Commande introuvable.');
      return NextResponse.json({ ok: true, order: serializeOrder(row, { includeDocument: true, includeCustomer: true }) });
    }
    const profile = await requireClientProfile();
    return NextResponse.json({ ok: true, order: await getCustomerOrder(profile.id, id) });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
