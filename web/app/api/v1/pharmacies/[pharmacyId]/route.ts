import { NextResponse } from 'next/server';
import { catalogErrorResponse } from '@/lib/catalog/http';
import { canAccessPharmacy } from '@/lib/catalog/pharmacyAuth';
import { getPharmacyById, listPharmacyOffers, serializePharmacy, serializePharmacyOffer } from '@/lib/catalog/pharmacyQueries';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ pharmacyId: string }> }) {
  try {
    const { pharmacyId } = await params;
    const pharmacy = await getPharmacyById(pharmacyId);
    const privileged = await canAccessPharmacy(pharmacy.id);
    const offers = privileged ? await listPharmacyOffers(pharmacy.id) : [];
    return NextResponse.json({
      pharmacy: serializePharmacy(pharmacy, { includeContact: privileged }),
      ...(privileged ? { offers: offers.map(serializePharmacyOffer) } : {}),
    });
  } catch (err) {
    return catalogErrorResponse(err);
  }
}
