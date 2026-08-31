export type ProductCountryStatus = 'PENDING' | 'ACTIVE' | 'RESTRICTED' | 'INACTIVE' | 'UNKNOWN';

export const productCountryStatuses: ProductCountryStatus[] = [
  'PENDING',
  'ACTIVE',
  'RESTRICTED',
  'INACTIVE',
  'UNKNOWN',
];

export type PublicCountry = {
  id: string;
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
};

export type RegulatoryPublic = {
  status: ProductCountryStatus;
  requiresPrescription: boolean;
  verified: boolean;
  verifiedAt: string | null;
  regulatoryReference: string | null;
  regulatoryNote: string | null;
};

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  genericName: string | null;
  brandName: string | null;
  activeIngredient: string | null;
  dosage: string | null;
  dosageUnit: string | null;
  pharmaceuticalForm: string | null;
  packaging: string | null;
  description: string | null;
  imageUrl: string | null;
  category: PublicCategory;
  countryCode: string;
  requiresPrescription: boolean;
  regulatory: RegulatoryPublic;
  prescriptionHint: string | null;
};

export type PharmacyOffer = {
  pharmacy: {
    id: string;
    accountId: string | null;
    name: string;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    verified: boolean;
  };
  price: number;
  currency: string;
  stockQuantity: number;
  available: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  distanceKm: number | null;
};

export type OfferInput = {
  productId: string;
  price: number;
  stockQuantity: number;
  available: boolean;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  internalReference?: string | null;
};
