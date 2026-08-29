import { getAdminState, type AdminCatalogItem, type AdminPharmacy } from './adminData';
import { productImageSrc } from './photos';
import { catalogTree, needsPrescription, sameCategory, type RegulatoryStatus } from './taxonomy';

export type Pharmacy = {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  distance: number;
  rating: number;
  reviewCount?: number;
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
  subcategory?: string;
  regulatoryStatus?: RegulatoryStatus;
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
  countries?: Array<'GA' | 'BJ' | 'CM'>;
};

const pharmacyAliases: Record<string, string> = {
  p1: 'ph-centre',
  p3: 'ph-palmiers',
  p4: 'ph-akpakpa',
  p5: 'ph-haievive',
  p6: 'ph-godomey',
  p7: 'ph-bonanjo',
  p8: 'ph-bastos',
  p9: 'ph-bonamoussadi',
};

const productAliases: Record<string, string> = {
  'pc-para': 'paracetamol',
  'pc-ibup': 'ibuprofene',
  'pc-amox': 'amoxicilline',
  'pc-metf': 'metformine',
  'pc-amlo': 'amlodipine',
  'pc-cipro': 'ciprofloxacine',
  'pc-vitc': 'vitamine-c',
  'pc-vitd': 'vitamine-d',
  'pc-mag': 'magnesium',
  'pc-bandage': 'pansement',
  'pc-compresse': 'compresses',
  'pc-thermo': 'thermometre',
  'pc-gel': 'gel-hydro',
  'pc-savon': 'savon-surgras',
  'pc-lait': 'lait-1er-age',
  'pc-couches': 'couches-t3',
  'pc-serum': 'serum-physio',
  'pc-solaire': 'creme-solaire',
  'pc-baume': 'baume-levres',
  'pc-glyco': 'bandelettes-glycemie',
  'pc-preserv': 'preservatifs',
  amoxicillin: 'amoxicilline',
  'vitamin-c': 'vitamine-c',
  bandages: 'pansement',
};

export const categories = catalogTree.map((c) => ({
  name: c.name,
  icon: c.icon,
  image: `/categories/${c.photo}.png?v=2`,
}));

export const paymentMethods: PaymentMethod[] = [
  { id: 'mobicash', name: 'MobiCash', operator: 'Gabon Telecom', ussd: '*555#', color: '#E87722', background: '#FFF4E8', countries: ['GA'] },
  { id: 'airtel-money', name: 'Airtel Money', operator: 'Airtel Gabon', ussd: '*150#', color: '#E4002B', background: '#FDE8EC', countries: ['GA'] },
  { id: 'moov-money', name: 'Moov Money', operator: 'Moov Africa', ussd: '*555#', color: '#0077C8', background: '#E8F4FC', countries: ['GA'] },
  { id: 'geniuspay', name: 'GeniusPay', operator: 'MTN MoMo · Moov Money Bénin', ussd: '', color: '#0B4F8A', background: '#E8F1F8', countries: ['BJ'] },
  { id: 'card', name: 'Carte bancaire', operator: 'Visa · Mastercard', ussd: '', color: '#635BFF', background: '#EEF0FF', countries: ['GA', 'BJ', 'CM'] },
];

export function methodsForCountry(country?: string | null) {
  const id = country === 'BJ' || country === 'CM' ? country : 'GA';
  return paymentMethods.filter((m) => !m.countries || m.countries.includes(id));
}

function toPharmacy(p: AdminPharmacy): Pharmacy {
  return {
    id: p.id,
    name: p.pharmacyName,
    area: `${p.area}, ${p.city}`,
    latitude: p.latitude,
    longitude: p.longitude,
    distance: p.distance,
    rating: p.rating,
    reviewCount: p.reviewCount ?? 12,
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
    subcategory: first.subcategory,
    regulatoryStatus: first.regulatoryStatus,
    description: first.description,
    requiresPrescription: first.requiresPrescription ?? needsPrescription(first.regulatoryStatus || 'otc'),
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

export function pharmacyAccountIdFor(pharmacy: { id: string; name: string }) {
  if (pharmacyAliases[pharmacy.id]) return pharmacyAliases[pharmacy.id];
  if (pharmacy.id.startsWith('ph-')) return pharmacy.id;
  if (pharmacy.name.toLowerCase().includes('centre')) return 'ph-centre';
  if (pharmacy.name.toLowerCase().includes('palmier')) return 'ph-palmiers';
  return pharmacy.id;
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

export function searchProducts(
  query: string,
  opts: { category?: string; subcategory?: string; status?: RegulatoryStatus | 'rx-any' } = {},
) {
  const list = getPublicProducts();
  const q = fold(query);
  return list.filter((p) => {
    if (opts.category && !sameCategory(p.category, opts.category)) return false;
    if (opts.subcategory && p.subcategory !== opts.subcategory) return false;
    if (opts.status === 'rx-any' && !p.requiresPrescription) return false;
    if (opts.status && opts.status !== 'rx-any' && (p.regulatoryStatus || (p.requiresPrescription ? 'rx' : 'otc')) !== opts.status)
      return false;
    if (!q) return true;
    return (
      fold(p.name).includes(q) ||
      fold(p.genericName).includes(q) ||
      fold(p.category).includes(q) ||
      fold(p.subcategory || '').includes(q)
    );
  });
}

function fold(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
