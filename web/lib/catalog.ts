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

export const pharmacies: Pharmacy[] = [
  {
    id: 'p1',
    name: 'Pharmacie du Centre',
    area: 'Centre-ville, Libreville',
    latitude: 0.3901,
    longitude: 9.4544,
    distance: 0.8,
    rating: 4.8,
    open: true,
    delivery: true,
    pickup: true,
    fee: 1000,
    eta: '25-35 min',
  },
  {
    id: 'p2',
    name: 'Pharmacie Santé Plus',
    area: 'Quartier Louis, Libreville',
    latitude: 0.4168,
    longitude: 9.4472,
    distance: 1.7,
    rating: 4.6,
    open: true,
    delivery: true,
    pickup: true,
    fee: 1500,
    eta: '35-45 min',
  },
  {
    id: 'p3',
    name: 'Pharmacie des Palmiers',
    area: 'Owendo, Libreville',
    latitude: 0.3482,
    longitude: 9.5041,
    distance: 2.9,
    rating: 4.5,
    open: false,
    delivery: false,
    pickup: true,
    fee: 0,
    eta: 'Retrait demain',
  },
];

export const products: Product[] = [
  {
    id: 'paracetamol',
    name: 'Paracétamol 500 mg',
    genericName: 'Paracétamol',
    dosage: '500 mg',
    form: 'Comprimés',
    category: 'Médicaments',
    description:
      'Traitement symptomatique de la douleur et de la fièvre. Respectez la notice et les conseils d’un professionnel de santé.',
    requiresPrescription: false,
    offers: [
      { id: 'o1', pharmacy: pharmacies[0], price: 3500, stock: 20 },
      { id: 'o2', pharmacy: pharmacies[1], price: 3000, stock: 8 },
      { id: 'o3', pharmacy: pharmacies[2], price: 2900, stock: 0 },
    ],
  },
  {
    id: 'amoxicilline',
    name: 'Amoxicilline 500 mg',
    genericName: 'Amoxicilline',
    dosage: '500 mg',
    form: 'Gélules',
    category: 'Médicaments',
    description:
      'Antibiotique soumis à prescription. La pharmacie doit valider l’ordonnance avant tout paiement.',
    requiresPrescription: true,
    offers: [
      { id: 'o4', pharmacy: pharmacies[0], price: 6200, stock: 12 },
      { id: 'o5', pharmacy: pharmacies[1], price: 6500, stock: 6 },
    ],
  },
  {
    id: 'vitamine-c',
    name: 'Vitamine C 1000 mg',
    genericName: 'Acide ascorbique',
    dosage: '1000 mg',
    form: 'Comprimés effervescents',
    category: 'Vitamines',
    description: 'Complément alimentaire en comprimés effervescents.',
    requiresPrescription: false,
    offers: [
      { id: 'o6', pharmacy: pharmacies[0], price: 4500, stock: 16 },
      { id: 'o7', pharmacy: pharmacies[1], price: 4100, stock: 10 },
    ],
  },
  {
    id: 'pansement',
    name: 'Pansements stériles',
    genericName: 'Pansement',
    dosage: 'Boîte de 20',
    form: 'Boîte',
    category: 'Premiers soins',
    description: 'Pansements individuels stériles pour petites plaies.',
    requiresPrescription: false,
    offers: [{ id: 'o8', pharmacy: pharmacies[0], price: 2200, stock: 30 }],
  },
];

export const categories = [
  { name: 'Médicaments', icon: '💊' },
  { name: 'Hygiène', icon: '✨' },
  { name: 'Bébé', icon: '👶' },
  { name: 'Premiers soins', icon: '🩹' },
  { name: 'Vitamines', icon: '🍊' },
  { name: 'Parapharmacie', icon: '🌿' },
];

export const paymentMethods: PaymentMethod[] = [
  { id: 'mobicash', name: 'MobiCash', operator: 'Gabon Telecom', ussd: '*555#', color: '#E87722', background: '#FFF4E8' },
  { id: 'airtel-money', name: 'Airtel Money', operator: 'Airtel Gabon', ussd: '*150#', color: '#E4002B', background: '#FDE8EC' },
  { id: 'moov-money', name: 'Moov Money', operator: 'Moov Africa', ussd: '*555#', color: '#0077C8', background: '#E8F4FC' },
];

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

export function getPharmacy(id: string) {
  return pharmacies.find((p) => p.id === id);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function productsForPharmacy(pharmacyId: string) {
  return products.filter((p) => p.offers.some((o) => o.pharmacy.id === pharmacyId && o.stock > 0));
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.genericName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}
