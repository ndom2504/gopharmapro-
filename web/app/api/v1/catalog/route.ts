import { getPublicPharmacies, getPublicProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    pharmacies: getPublicPharmacies(),
    products: getPublicProducts(),
  });
}
