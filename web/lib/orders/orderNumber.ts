import { catalogDb } from '@/lib/prisma';

export function currentOrderYear(date = new Date()) {
  return date.getUTCFullYear();
}

export function formatOrderNumber(year: number, seq: number) {
  return `GP-${year}-${String(seq).padStart(6, '0')}`;
}

export async function nextOrderNumber() {
  const db = catalogDb();
  const year = currentOrderYear();
  const prefix = `GP-${year}-`;
  const last = await db.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  });
  const current = last ? Number(last.orderNumber.slice(prefix.length)) : 0;
  const seq = Number.isInteger(current) && current > 0 ? current + 1 : 1;
  return formatOrderNumber(year, seq);
}
