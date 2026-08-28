import { pharmacies, products } from '@/lib/catalog';

export function GET() {
  return Response.json({ pharmacies, products });
}
