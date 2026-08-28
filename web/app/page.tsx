import { ClientHome } from '@/components/ClientHome';
import { getPublicPharmacies, getPublicProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default function Home() {
  return <ClientHome pharmacies={getPublicPharmacies()} products={getPublicProducts()} />;
}
