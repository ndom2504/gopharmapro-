import { getAdminState, type AdminCatalogItem, type AdminPharmacy } from './adminData';
import { productImageSrc } from './photos';

export type Pharmacy = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number;
  open: boolean;
  delivery: boolean;
  pickup: boolean;
  fee: number;
  eta: string;
  verified: boolean;
};

export type Offer = { id: string; pharmacy: Pharmacy; price: number; stock: number };

export type Product = {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  category: string;
  description: string;
  requiresPrescription: boolean;
  imageKey?: string;
  imageSrc?: string;
  offers: Offer[];
};

export type PaymentMethod = {
  id: string;
  name: string;
  operator: string;
  ussd: string;
  color: string;
  background: string;
};

const pharmacyAliases: Record<string, string> = {
  p1: 'ph-centre',
  p3: 'ph-palmiers',
};

const productAliases: Record<string, string> = {
  'pc-para': 'paracetamol',
  'pc-amox': 'amoxicilline',
  'pc-vitc': 'vitamine-c',
  'pc-bandage': 'pansement',
  amoxicillin: 'amoxicilline',
  'vitamin-c': 'vitamine-c',
  bandages: 'pansement',
};

export const categories = [
  { name: 'Médicaments', icon: '💊', image: '/categories/medicaments.png' },
  { name: 'Premiers soins', icon: '🩹', image: '/categories/premiers-soins.png' },
  { name: 'Hygiène', icon: '🧴', image: '/categories/hygiene.png' },
  { name: 'Bébé', icon: '👶', image: '/categories/bebe.png' },
  { name: 'Vitamines', icon: '💪', image: '/categories/vitamines.png' },
  { name: 'Parapharmacie', icon: '🧴', image: '/categories/parapharmacie.png' },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'mobicash', name: 'MobiCash', operator: 'Gabon Telecom', ussd: '*555#', color: '#E87722', background: '#FFF4E8' },
  { id: 'airtel-money', name: 'Airtel Money', operator: 'Airtel Gabon', ussd: '*150#', color: '#E4002B', background: '#FDE8EC' },
  { id: 'moov-money', name: 'Moov Money', operator: 'Moov Africa', ussd: '*555#', color: '#0077C8', background: '#E8F4FC' },
  { id: 'card', name: 'Carte bancaire', operator: 'Visa · Mastercard', ussd: '', color: '#635BFF', background: '#EEF0FF' },
];

function toPharmacy(p: AdminPharmacy): Pharmacy {
  return {
    id: p.id,
    name: p.pharmacyName,
    area: `${p.area}, ${p.city}`,
    latitude: p.latitude,
    longitude: p.longitude,
    distance: p.distance,
    rating: p.rating,
    open: p.open,
    delivery: p.delivery,
    pickup: p.pickup,
    fee: p.fee,
    eta: p.eta,
    verified: p.status === 'verified',
  };
}

export function getPublicPharmacies(): Pharmacy[] {
  return getAdminState()
    .pharmacies.filter((p) => p.status === 'verified')
    .map(toPharmacy);
}

function toProduct(slug: string, items: AdminCatalogItem[], pharmacies: Map<string, Pharmacy>): Product | null {
  const first = items[0];
  const offers = items
    .map((i) => {
      const pharmacy = pharmacies.get(i.pharmacyId);
      if (!pharmacy) return null;
      return { id: i.id, pharmacy, price: i.price, stock: i.stock };
    })
    .filter((o): o is Offer => Boolean(o));
  if (!offers.length) return null;
  return {
    id: slug,
    name: first.name,
    genericName: first.genericName,
    dosage: first.dosage,
    form: first.form,
    category: first.category,
    description: first.description,
    requiresPrescription: first.requiresPrescription,
    imageKey: first.imageKey,
    imageSrc: productImageSrc(first.imageKey),
    offers,
  };
}

export function getPublicProducts(): Product[] {
  const pharmacies = new Map(getPublicPharmacies().map((p) => [p.id, p]));
  const groups = new Map<string, AdminCatalogItem[]>();
  for (const item of getAdminState().catalog) {
    if (item.status !== 'published') continue;
    const list = groups.get(item.slug) || [];
    list.push(item);
    groups.set(item.slug, list);
  }
  return [...groups.entries()]
    .map(([slug, items]) => toProduct(slug, items, pharmacies))
    .filter((p): p is Product => Boolean(p && p.offers.length));
}

export function formatFcfa(value: number) {
  return `${value.toLocaleString('fr-FR')} FCFA`;
}

export function formatKm(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function lowestPrice(product: Product) {
  const stocked = product.offers.filter((o) => o.stock > 0);
  const list = stocked.length ? stocked : product.offers;
  return Math.min(...list.map((o) => o.price));
}

export function resolvePharmacyId(id: string) {
  return pharmacyAliases[id] || id;
}

export function getPharmacy(id: string) {
  const resolved = resolvePharmacyId(id);
  return getPublicPharmacies().find((p) => p.id === resolved);
}

export function resolveProductId(id: string) {
  return productAliases[id] || id;
}

export function getProduct(id: string) {
  const resolved = resolveProductId(id);
  return getPublicProducts().find((p) => p.id === resolved);
}

export function productsForPharmacy(pharmacyId: string) {
  const resolved = resolvePharmacyId(pharmacyId);
  return getPublicProducts().filter((p) => p.offers.some((o) => o.pharmacy.id === resolved && o.stock > 0));
}

export function searchProducts(query: string) {
  const list = getPublicProducts();
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.genericName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}
