import { taxonomyFor } from './taxonomy';

export type UserRole = 'client' | 'pharmacy' | 'courier';
export type DocStatus = 'pending' | 'verified' | 'rejected';
export type PharmacyStatus = 'pending' | 'verified' | 'rejected';
export type IdentityStatus = 'unverified' | 'pending' | 'verified' | 'canceled';
export type CourierStatus = 'pending' | 'active' | 'suspended';

export type PartnerDoc = {
  key: string;
  label: string;
  required: boolean;
  fileName?: string;
  status: DocStatus;
};

export type AuthProvider = 'password' | 'google';

export type ClientAccount = {
  role: 'client';
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  provider?: AuthProvider;
  googleId?: string;
  photoDataUrl?: string;
  address?: string;
  area?: string;
  city?: string;
  preferredPayment?: string;
  notifyOrders?: boolean;
  notifyOffers?: boolean;
};

export type AccountPatch = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  area?: string;
  city?: string;
  commune?: string;
  photoDataUrl?: string;
  preferredPayment?: string;
  notifyOrders?: boolean;
  notifyOffers?: boolean;
  pharmacyName?: string;
  pharmacistName?: string;
  professionalNumber?: string;
  vehicle?: string;
  plate?: string;
  payoutPhone?: string;
  password?: string;
  currentPassword?: string;
};

export type PharmacyAccount = {
  role: 'pharmacy';
  id: string;
  pharmacyName: string;
  pharmacistName: string;
  professionalNumber: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  area: string;
  commune: string;
  city: string;
  province: string;
  managerRole: string;
  status: PharmacyStatus;
  identityStatus: IdentityStatus;
  identitySessionId?: string;
  documents: PartnerDoc[];
};

export type CourierAccount = {
  role: 'courier';
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  vehicle: string;
  plate: string;
  area: string;
  city: string;
  province: string;
  payoutPhone: string;
  status: CourierStatus;
  documents: PartnerDoc[];
  provider?: AuthProvider;
  googleId?: string;
};

export type StoredAccount = ClientAccount | PharmacyAccount | CourierAccount;
export type ShopSession = Omit<ClientAccount, 'password'> | Omit<PharmacyAccount, 'password'> | Omit<CourierAccount, 'password'>;

export const pharmacyDocs = (status: DocStatus, withFiles = true): PartnerDoc[] => [
  { key: 'authorization', label: 'Autorisation / agrément', required: true, fileName: withFiles ? 'authorization.pdf' : undefined, status },
  { key: 'identification', label: 'Identification de la structure', required: true, fileName: withFiles ? 'identification.pdf' : undefined, status },
  { key: 'manager', label: 'Justificatif du responsable', required: true, fileName: withFiles ? 'manager.pdf' : undefined, status },
  { key: 'professional', label: 'Document professionnel', required: true, fileName: withFiles ? 'professional.pdf' : undefined, status },
];

export const courierDocs = (status: DocStatus, withFiles = true): PartnerDoc[] => [
  { key: 'idCard', label: 'Pièce d’identité (CNI ou passeport)', required: true, fileName: withFiles ? 'idCard.pdf' : undefined, status },
  { key: 'license', label: 'Permis de conduire', required: true, fileName: withFiles ? 'license.pdf' : undefined, status },
  { key: 'vehicle', label: 'Carte grise ou assurance du véhicule', required: true, fileName: withFiles ? 'vehicle.pdf' : undefined, status },
  { key: 'photo', label: 'Photo du livreur', required: false, fileName: withFiles && status === 'verified' ? 'photo.jpg' : undefined, status },
];

export const accountSeed: StoredAccount[] = [
  {
    role: 'client',
    id: 'c-awa',
    firstName: 'Awa',
    lastName: 'Diop',
    phone: '+241 77 00 00 00',
    email: 'awa@pharmamarket.ga',
    password: 'demo123',
    provider: 'password',
  },
  {
    role: 'pharmacy',
    id: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    pharmacistName: 'Ndong Mba',
    professionalNumber: 'ONPG-1284',
    phone: '+241 77 11 22 33',
    email: 'centre@pharma.ga',
    password: 'demo123',
    address: 'Boulevard de l’Indépendance',
    area: 'Centre-ville',
    commune: 'Libreville',
    city: 'Libreville',
    province: 'Estuaire',
    managerRole: 'titulaire',
    status: 'verified',
    identityStatus: 'verified',
    documents: pharmacyDocs('verified'),
  },
  {
    role: 'pharmacy',
    id: 'ph-palmiers',
    pharmacyName: 'Pharmacie des Palmiers',
    pharmacistName: 'Léa Obiang',
    professionalNumber: 'ONPG-2201',
    phone: '+241 77 22 33 44',
    email: 'palmiers@pharma.ga',
    password: 'demo123',
    address: 'Route de la gare d’Owendo',
    area: 'Owendo',
    commune: 'Owendo',
    city: 'Libreville',
    province: 'Estuaire',
    managerRole: 'titulaire',
    status: 'pending',
    identityStatus: 'unverified',
    documents: pharmacyDocs('pending'),
  },
  {
    role: 'courier',
    id: 'd-jean',
    firstName: 'Jean',
    lastName: 'Mba',
    phone: '+241 66 00 00 00',
    email: 'livreur@gopharmapro.com',
    password: 'demo123',
    vehicle: 'moto',
    plate: 'LBV-204-GA',
    area: 'Centre-ville',
    city: 'Libreville',
    province: 'Estuaire',
    payoutPhone: '+241 66 00 00 00',
    status: 'active',
    documents: courierDocs('verified'),
    provider: 'password',
  },
  {
    role: 'courier',
    id: 'd-paul',
    firstName: 'Paul',
    lastName: 'Nzé',
    phone: '+241 66 11 22 33',
    email: 'paul.livreur@gopharmapro.com',
    password: 'demo123',
    vehicle: 'moto',
    plate: 'LBV-318-GA',
    area: 'Owendo',
    city: 'Libreville',
    province: 'Estuaire',
    payoutPhone: '+241 66 11 22 33',
    status: 'pending',
    documents: courierDocs('pending'),
    provider: 'password',
  },
];

export type PartnerCatalogItem = {
  id: string;
  pharmacyId: string;
  name: string;
  category: string;
  subcategory?: string;
  regulatoryStatus?: 'otc' | 'rx' | 'controlled';
  price: number;
  stock: number;
  status: 'published' | 'review';
  imageKey: string;
};

const partnerCatalogSeed: PartnerCatalogItem[] = [
  { id: 'pc-para', pharmacyId: 'ph-centre', name: 'Paracétamol 500 mg', category: 'Médicaments', price: 3500, stock: 20, status: 'published', imageKey: 'paracetamol' },
  { id: 'pc-ibup', pharmacyId: 'ph-centre', name: 'Ibuprofène 400 mg', category: 'Médicaments', price: 2800, stock: 18, status: 'published', imageKey: 'paracetamol' },
  { id: 'pc-amox', pharmacyId: 'ph-centre', name: 'Amoxicilline 500 mg', category: 'Médicaments', price: 6200, stock: 12, status: 'published', imageKey: 'amoxicillin' },
  { id: 'pc-metf', pharmacyId: 'ph-centre', name: 'Metformine 1000 mg', category: 'Médicaments', price: 5400, stock: 10, status: 'published', imageKey: 'amoxicillin' },
  { id: 'pc-amlo', pharmacyId: 'ph-centre', name: 'Amlodipine 5 mg', category: 'Médicaments', price: 4800, stock: 9, status: 'published', imageKey: 'amoxicillin' },
  { id: 'pc-cipro', pharmacyId: 'ph-centre', name: 'Ciprofloxacine 500 mg', category: 'Médicaments', price: 7100, stock: 6, status: 'review', imageKey: 'amoxicillin' },
  { id: 'pc-vitc', pharmacyId: 'ph-centre', name: 'Vitamine C 1000 mg', category: 'Vitamines', price: 4500, stock: 16, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-vitd', pharmacyId: 'ph-centre', name: 'Vitamine D3 1000 UI', category: 'Vitamines', price: 5200, stock: 14, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-mag', pharmacyId: 'ph-centre', name: 'Magnésium B6', category: 'Vitamines', price: 3900, stock: 11, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-bandage', pharmacyId: 'ph-centre', name: 'Pansements stériles', category: 'Premiers soins', price: 2200, stock: 30, status: 'published', imageKey: 'bandages' },
  { id: 'pc-compresse', pharmacyId: 'ph-centre', name: 'Compresses stériles', category: 'Premiers soins', price: 1800, stock: 22, status: 'published', imageKey: 'bandages' },
  { id: 'pc-thermo', pharmacyId: 'ph-centre', name: 'Thermomètre digital', category: 'Premiers soins', price: 6500, stock: 8, status: 'published', imageKey: 'bandages' },
  { id: 'pc-gel', pharmacyId: 'ph-centre', name: 'Gel hydroalcoolique 100 ml', category: 'Hygiène', price: 1500, stock: 40, status: 'published', imageKey: 'bandages' },
  { id: 'pc-savon', pharmacyId: 'ph-centre', name: 'Savon surgras 150 g', category: 'Hygiène', price: 1200, stock: 25, status: 'published', imageKey: 'bandages' },
  { id: 'pc-lait', pharmacyId: 'ph-centre', name: 'Lait 1er âge 400 g', category: 'Bébé', price: 8900, stock: 7, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-couches', pharmacyId: 'ph-centre', name: 'Couches taille 3', category: 'Bébé', price: 7200, stock: 15, status: 'published', imageKey: 'bandages' },
  { id: 'pc-serum', pharmacyId: 'ph-centre', name: 'Sérum physiologique', category: 'Bébé', price: 2100, stock: 19, status: 'published', imageKey: 'bandages' },
  { id: 'pc-solaire', pharmacyId: 'ph-centre', name: 'Crème solaire SPF 50', category: 'Parapharmacie', price: 7800, stock: 10, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-baume', pharmacyId: 'ph-centre', name: 'Baume à lèvres', category: 'Parapharmacie', price: 900, stock: 28, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-glyco', pharmacyId: 'ph-centre', name: 'Bandelettes glycémie', category: 'Diabète', price: 8500, stock: 9, status: 'published', imageKey: 'bandages' },
  { id: 'pc-preserv', pharmacyId: 'ph-centre', name: 'Préservatifs', category: 'Santé sexuelle', price: 2500, stock: 20, status: 'published', imageKey: 'bandages' },
];

export const partnerCatalog: PartnerCatalogItem[] = partnerCatalogSeed.map((i) => {
  const tax = taxonomyFor(i.id, i.category);
  return { ...i, category: tax.category, subcategory: tax.subcategory, regulatoryStatus: tax.regulatoryStatus };
});

export type PartnerOrderItem = { name: string; quantity: number };

export type PartnerOrder = {
  id: string;
  pharmacyAccountId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  courierId?: string;
  total: number;
  fee: number;
  status: 'ready' | 'accepted' | 'picked_up' | 'arrived' | 'delivered';
  pickupCode: string;
  deliveryCode: string;
  deliveryAddress: string;
  items: PartnerOrderItem[];
  eta: string;
  pharmacyKm: string;
  clientKm: string;
  createdAt: string;
};

export const partnerOrders: PartnerOrder[] = [
  {
    id: 'GP-10482',
    pharmacyAccountId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    pharmacyAddress: 'Boulevard de l’Indépendance, Libreville',
    courierId: 'd-jean',
    total: 12500,
    fee: 2000,
    status: 'picked_up',
    pickupCode: '482193',
    deliveryCode: '739204',
    deliveryAddress: 'Libreville, Gabon',
    items: [
      { name: 'Paracétamol 500 mg', quantity: 2 },
      { name: 'Vitamine C', quantity: 1 },
    ],
    eta: '15 min',
    pharmacyKm: '1,4 km',
    clientKm: '1,8 km',
    createdAt: '2026-08-28',
  },
  {
    id: 'GP-10490',
    pharmacyAccountId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    pharmacyAddress: 'Boulevard de l’Indépendance, Libreville',
    total: 8000,
    fee: 2000,
    status: 'ready',
    pickupCode: '591047',
    deliveryCode: '418263',
    deliveryAddress: 'Owendo, Libreville',
    items: [{ name: 'Vitamine C 1000 mg', quantity: 1 }],
    eta: '25 min',
    pharmacyKm: '1,4 km',
    clientKm: '3,2 km',
    createdAt: '2026-08-28',
  },
];

export type PartnerPayout = {
  id: string;
  orderId: string;
  accountId: string;
  beneficiary: 'pharmacy' | 'courier';
  amount: number;
  status: 'pending' | 'sent';
  phone: string;
};

export const partnerPayouts: PartnerPayout[] = [
  { id: 'po-ph-10482', orderId: 'GP-10482', accountId: 'ph-centre', beneficiary: 'pharmacy', amount: 10500, status: 'sent', phone: '+241 77 11 22 33' },
  { id: 'po-d-10482', orderId: 'GP-10482', accountId: 'd-jean', beneficiary: 'courier', amount: 2000, status: 'pending', phone: '+241 66 00 00 00' },
  { id: 'po-d-10461', orderId: 'GP-10461', accountId: 'd-jean', beneficiary: 'courier', amount: 1500, status: 'sent', phone: '+241 66 00 00 00' },
];

export function stripPassword(user: StoredAccount): ShopSession {
  const { password: _p, ...session } = user;
  return session;
}

export function isClient(session: ShopSession | null): session is Omit<ClientAccount, 'password'> {
  return session?.role === 'client';
}

export function isPharmacy(session: ShopSession | null): session is Omit<PharmacyAccount, 'password'> {
  return session?.role === 'pharmacy';
}

export function isCourier(session: ShopSession | null): session is Omit<CourierAccount, 'password'> {
  return session?.role === 'courier';
}

export function displayName(session: ShopSession) {
  if (session.role === 'pharmacy') return session.pharmacyName;
  return session.firstName;
}

export function homeFor(role: UserRole) {
  if (role === 'pharmacy') return '/espace-pharmacie';
  if (role === 'courier') return '/espace-livreur';
  return '/';
}

export function payoutTotals(items: PartnerPayout[], accountId: string) {
  const mine = items.filter((p) => p.accountId === accountId);
  return {
    pending: mine.filter((p) => p.status === 'pending').reduce((a, p) => a + p.amount, 0),
    sent: mine.filter((p) => p.status === 'sent').reduce((a, p) => a + p.amount, 0),
  };
}

export type PharmacyRegisterInput = {
  pharmacyName: string;
  pharmacistName: string;
  professionalNumber: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  area: string;
  city: string;
};

export type CourierRegisterInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  vehicle: string;
  plate: string;
  city: string;
};
