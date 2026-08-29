export type DocStatus = 'pending' | 'verified' | 'rejected';
export type PharmacyStatus = 'pending' | 'verified' | 'rejected';
export type CourierStatus = 'pending' | 'active' | 'suspended';
export type CatalogStatus = 'published' | 'review';
export type PayoutStatus = 'pending' | 'sent';
export type OrderStatus = 'paid' | 'preparing' | 'ready' | 'picked_up' | 'delivered';

export type AdminDocument = {
  key: string;
  label: string;
  required: boolean;
  fileName?: string;
  status: DocStatus;
};

export type AdminPharmacy = {
  id: string;
  pharmacyName: string;
  pharmacistName: string;
  professionalNumber: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  commune: string;
  city: string;
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
  status: PharmacyStatus;
  identityStatus: 'unverified' | 'pending' | 'verified' | 'canceled';
  documents: AdminDocument[];
};

export type AdminCourier = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  vehicle: string;
  plate: string;
  area: string;
  status: CourierStatus;
  documents: AdminDocument[];
};

export type PaymentSplit = {
  subtotal: number;
  deliveryFee: number;
  pharmacyNet: number;
  courierNet: number;
  platformFee: number;
};

export type AdminCatalogItem = {
  id: string;
  slug: string;
  pharmacyId: string;
  pharmacyName: string;
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  category: string;
  description: string;
  requiresPrescription: boolean;
  status: CatalogStatus;
  price: number;
  stock: number;
  imageKey: string;
};

export type AdminOrder = {
  id: string;
  pharmacyName: string;
  total: number;
  paymentLabel: string;
  reference: string;
  status: OrderStatus;
  createdAt: string;
  split: PaymentSplit;
};

export type AdminPayout = {
  id: string;
  orderId: string;
  beneficiary: 'pharmacy' | 'courier';
  phone: string;
  amount: number;
  status: PayoutStatus;
};

type AdminState = {
  pharmacies: AdminPharmacy[];
  couriers: AdminCourier[];
  catalog: AdminCatalogItem[];
  orders: AdminOrder[];
  payouts: AdminPayout[];
};

const pharmacyDocs = (status: DocStatus, withFiles: boolean): AdminDocument[] => [
  { key: 'authorization', label: 'Autorisation / agrément', required: true, fileName: withFiles ? 'authorization.pdf' : undefined, status },
  { key: 'identification', label: 'Identification de la structure', required: true, fileName: withFiles ? 'identification.pdf' : undefined, status },
  { key: 'manager', label: 'Justificatif du responsable', required: true, fileName: withFiles ? 'manager.pdf' : undefined, status },
  { key: 'professional', label: 'Document professionnel', required: true, fileName: withFiles ? 'professional.pdf' : undefined, status },
];

const courierDocs = (status: DocStatus, withFiles: boolean): AdminDocument[] => [
  { key: 'idCard', label: 'Pièce d’identité (CNI ou passeport)', required: true, fileName: withFiles ? 'idCard.pdf' : undefined, status },
  { key: 'license', label: 'Permis de conduire', required: true, fileName: withFiles ? 'license.pdf' : undefined, status },
  { key: 'vehicle', label: 'Carte grise ou assurance du véhicule', required: true, fileName: withFiles ? 'vehicle.pdf' : undefined, status },
  { key: 'photo', label: 'Photo du livreur', required: false, fileName: withFiles ? 'photo.jpg' : undefined, status },
];

let state: AdminState = {
  pharmacies: [
    {
      id: 'ph-centre',
      pharmacyName: 'Pharmacie du Centre',
      pharmacistName: 'Ndong Mba',
      professionalNumber: 'ONPG-1284',
      phone: '+241 77 11 22 33',
      email: 'centre@pharma.ga',
      address: 'Boulevard de l’Indépendance',
      area: 'Centre-ville',
      commune: 'Libreville',
      city: 'Libreville',
      latitude: 0.3901,
      longitude: 9.4544,
      distance: 0.8,
      rating: 4.8,
      reviewCount: 24,
      open: true,
      delivery: true,
      pickup: true,
      fee: 1000,
      eta: '25-35 min',
      status: 'verified',
      identityStatus: 'verified',
      documents: pharmacyDocs('verified', true),
    },
    {
      id: 'ph-palmiers',
      pharmacyName: 'Pharmacie des Palmiers',
      pharmacistName: 'Léa Obiang',
      professionalNumber: 'ONPG-2201',
      phone: '+241 77 22 33 44',
      email: 'palmiers@pharma.ga',
      address: 'Route de la gare d’Owendo',
      area: 'Owendo',
      commune: 'Owendo',
      city: 'Libreville',
      latitude: 0.3482,
      longitude: 9.5041,
      distance: 2.9,
      rating: 4.5,
      reviewCount: 11,
      open: true,
      delivery: true,
      pickup: true,
      fee: 1500,
      eta: '35-45 min',
      status: 'pending',
      identityStatus: 'unverified',
      documents: pharmacyDocs('pending', true),
    },
  ],
  couriers: [
    {
      id: 'd-jean',
      firstName: 'Jean',
      lastName: 'Mba',
      phone: '+241 66 00 00 00',
      email: 'livreur@gopharmapro.com',
      vehicle: 'moto',
      plate: 'LBV-204-GA',
      area: 'Centre-ville',
      status: 'active',
      documents: courierDocs('verified', true),
    },
    {
      id: 'd-paul',
      firstName: 'Paul',
      lastName: 'Nzé',
      phone: '+241 66 11 22 33',
      email: 'paul.livreur@gopharmapro.com',
      vehicle: 'moto',
      plate: 'LBV-318-GA',
      area: 'Owendo',
      status: 'pending',
      documents: courierDocs('pending', true),
    },
  ],
  catalog: [
    {
      id: 'pc-para',
      slug: 'paracetamol',
      pharmacyId: 'ph-centre',
      pharmacyName: 'Pharmacie du Centre',
      name: 'Paracétamol 500 mg',
      genericName: 'Paracétamol',
      dosage: '500 mg',
      form: 'Comprimés',
      category: 'Médicaments',
      description: 'Traitement symptomatique de la douleur et de la fièvre. Respectez la notice et les conseils d’un professionnel de santé.',
      requiresPrescription: false,
      status: 'published',
      price: 3500,
      stock: 20,
      imageKey: 'paracetamol',
    },
    {
      id: 'pc-amox',
      slug: 'amoxicilline',
      pharmacyId: 'ph-centre',
      pharmacyName: 'Pharmacie du Centre',
      name: 'Amoxicilline 500 mg',
      genericName: 'Amoxicilline',
      dosage: '500 mg',
      form: 'Gélules',
      category: 'Médicaments',
      description: 'Antibiotique soumis à prescription. La pharmacie doit valider l’ordonnance avant tout paiement.',
      requiresPrescription: true,
      status: 'review',
      price: 6200,
      stock: 12,
      imageKey: 'amoxicillin',
    },
    {
      id: 'pc-vitc',
      slug: 'vitamine-c',
      pharmacyId: 'ph-centre',
      pharmacyName: 'Pharmacie du Centre',
      name: 'Vitamine C 1000 mg',
      genericName: 'Acide ascorbique',
      dosage: '1000 mg',
      form: 'Comprimés effervescents',
      category: 'Vitamines',
      description: 'Complément alimentaire en comprimés effervescents.',
      requiresPrescription: false,
      status: 'published',
      price: 4500,
      stock: 16,
      imageKey: 'vitamin-c',
    },
    {
      id: 'pc-bandage',
      slug: 'pansement',
      pharmacyId: 'ph-centre',
      pharmacyName: 'Pharmacie du Centre',
      name: 'Pansements stériles',
      genericName: 'Pansement',
      dosage: 'Boîte de 20',
      form: 'Boîte',
      category: 'Premiers soins',
      description: 'Pansements individuels stériles pour petites plaies.',
      requiresPrescription: false,
      status: 'published',
      price: 2200,
      stock: 30,
      imageKey: 'bandages',
    },
  ],
  orders: [
    {
      id: 'GP-10482',
      pharmacyName: 'Pharmacie du Centre',
      total: 12500,
      paymentLabel: 'Airtel Money',
      reference: 'AM-8F2K19',
      status: 'picked_up',
      createdAt: new Date().toISOString(),
      split: { subtotal: 11500, deliveryFee: 1000, pharmacyNet: 10500, courierNet: 2000, platformFee: 376 },
    },
  ],
  payouts: [
    { id: 'po-ph-10482', orderId: 'GP-10482', beneficiary: 'pharmacy', phone: '+241 77 11 22 33', amount: 10500, status: 'sent' },
    { id: 'po-d-10482', orderId: 'GP-10482', beneficiary: 'courier', phone: '+241 66 00 00 00', amount: 2000, status: 'pending' },
  ],
};

export function getAdminState(): AdminState {
  return state;
}

export function getPharmacy(id: string) {
  return state.pharmacies.find((p) => p.id === id);
}

export function setPharmacyStatus(id: string, status: PharmacyStatus) {
  state = {
    ...state,
    pharmacies: state.pharmacies.map((p) =>
      p.id === id
        ? {
            ...p,
            status,
            documents:
              status === 'verified'
                ? p.documents.map((d) => (d.fileName && d.required ? { ...d, status: 'verified' as const } : d))
                : p.documents,
          }
        : p,
    ),
  };
}

export function setCourierStatus(id: string, status: CourierStatus) {
  state = {
    ...state,
    couriers: state.couriers.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            documents:
              status === 'active'
                ? c.documents.map((d) => (d.fileName && d.required ? { ...d, status: 'verified' as const } : d))
                : c.documents,
          }
        : c,
    ),
  };
}

export function setDocumentStatus(accountId: string, docKey: string, status: DocStatus) {
  state = {
    ...state,
    pharmacies: state.pharmacies.map((p) =>
      p.id === accountId
        ? { ...p, documents: p.documents.map((d) => (d.key === docKey ? { ...d, status } : d)) }
        : p,
    ),
    couriers: state.couriers.map((c) =>
      c.id === accountId
        ? { ...c, documents: c.documents.map((d) => (d.key === docKey ? { ...d, status } : d)) }
        : c,
    ),
  };
}

export function setCatalogStatus(id: string, status: CatalogStatus) {
  state = {
    ...state,
    catalog: state.catalog.map((i) => (i.id === id ? { ...i, status } : i)),
  };
}

export function markPayoutSent(id: string) {
  state = {
    ...state,
    payouts: state.payouts.map((p) => (p.id === id ? { ...p, status: 'sent' } : p)),
  };
}

export function adminStats() {
  const pendingPh = state.pharmacies.filter((p) => p.status === 'pending').length;
  const pendingCo = state.couriers.filter((c) => c.status === 'pending').length;
  const review = state.catalog.filter((i) => i.status === 'review').length;
  const pendingPay = state.payouts.filter((p) => p.status === 'pending').reduce((a, p) => a + p.amount, 0);
  return {
    pendingPh,
    pendingCo,
    review,
    pendingPay,
    pharmacies: state.pharmacies.length,
    couriers: state.couriers.length,
    orders: state.orders.length,
    catalog: state.catalog.length,
  };
}
