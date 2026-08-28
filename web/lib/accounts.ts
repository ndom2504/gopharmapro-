export type UserRole = 'client' | 'pharmacy' | 'courier';
export type DocStatus = 'pending' | 'verified' | 'rejected';
export type PharmacyStatus = 'pending' | 'verified' | 'rejected';
export type CourierStatus = 'pending' | 'active' | 'suspended';

export type PartnerDoc = {
  key: string;
  label: string;
  required: boolean;
  fileName?: string;
  status: DocStatus;
};

export type ClientAccount = {
  role: 'client';
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
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
  },
];

export type PartnerCatalogItem = {
  id: string;
  pharmacyId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'published' | 'review';
  imageKey: string;
};

export const partnerCatalog: PartnerCatalogItem[] = [
  { id: 'pc-para', pharmacyId: 'ph-centre', name: 'Paracétamol 500 mg', category: 'Médicaments', price: 3500, stock: 20, status: 'published', imageKey: 'paracetamol' },
  { id: 'pc-amox', pharmacyId: 'ph-centre', name: 'Amoxicilline 500 mg', category: 'Médicaments', price: 6200, stock: 12, status: 'review', imageKey: 'amoxicillin' },
  { id: 'pc-vitc', pharmacyId: 'ph-centre', name: 'Vitamine C 1000 mg', category: 'Vitamines', price: 4500, stock: 16, status: 'published', imageKey: 'vitamin-c' },
  { id: 'pc-bandage', pharmacyId: 'ph-centre', name: 'Pansements stériles', category: 'Premiers soins', price: 2200, stock: 30, status: 'published', imageKey: 'bandages' },
];

export type PartnerOrder = {
  id: string;
  pharmacyAccountId: string;
  pharmacyName: string;
  courierId?: string;
  total: number;
  status: string;
  pickupCode: string;
  deliveryAddress: string;
};

export const partnerOrders: PartnerOrder[] = [
  {
    id: 'PM-1024',
    pharmacyAccountId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    courierId: 'd-jean',
    total: 5700,
    status: 'Prête',
    pickupCode: '482193',
    deliveryAddress: 'Libreville, Gabon',
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
  { id: 'po-ph-1024', orderId: 'PM-1024', accountId: 'ph-centre', beneficiary: 'pharmacy', amount: 4324, status: 'sent', phone: '+241 77 11 22 33' },
  { id: 'po-d-1024', orderId: 'PM-1024', accountId: 'd-jean', beneficiary: 'courier', amount: 1000, status: 'pending', phone: '+241 66 00 00 00' },
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
  return '/produits';
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
