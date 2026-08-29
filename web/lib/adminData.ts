import { needsPrescription, taxonomyFor } from './taxonomy';

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
  subcategory?: string;
  regulatoryStatus?: 'otc' | 'rx' | 'controlled';
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

function officineCatalog(
  pharmacyId: string,
  pharmacyName: string,
  rows: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    boolean,
    CatalogStatus,
    number,
    number,
    string,
  ][],
): AdminCatalogItem[] {
  return rows.map(
    ([id, slug, name, genericName, dosage, form, category, description, requiresPrescription, status, price, stock, imageKey]) => {
      const tax = taxonomyFor(slug, category, requiresPrescription);
      return {
        id,
        slug,
        pharmacyId,
        pharmacyName,
        name,
        genericName,
        dosage,
        form,
        category: tax.category,
        subcategory: tax.subcategory,
        regulatoryStatus: tax.regulatoryStatus,
        description,
        requiresPrescription: needsPrescription(tax.regulatoryStatus),
        status,
        price,
        stock,
        imageKey,
      };
    },
  );
}

function centreCatalog(
  rows: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    boolean,
    CatalogStatus,
    number,
    number,
    string,
  ][],
): AdminCatalogItem[] {
  return officineCatalog('ph-centre', 'Pharmacie du Centre', rows);
}

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
    {
      id: 'ph-akpakpa',
      pharmacyName: 'Pharmacie Akpakpa',
      pharmacistName: 'Awa Dossou',
      professionalNumber: 'ONPB-4412',
      phone: '+229 97 11 22 33',
      email: 'akpakpa@pharma.bj',
      address: 'Carrefour Akpakpa Dodomey',
      area: 'Akpakpa',
      commune: '5e arrondissement',
      city: 'Cotonou',
      latitude: 6.3602,
      longitude: 2.4578,
      distance: 1.1,
      rating: 4.7,
      reviewCount: 19,
      open: true,
      delivery: true,
      pickup: true,
      fee: 800,
      eta: '20-30 min',
      status: 'verified',
      identityStatus: 'verified',
      documents: pharmacyDocs('verified', true),
    },
    {
      id: 'ph-haievive',
      pharmacyName: 'Pharmacie Haie Vive',
      pharmacistName: 'Kodjo Mensah',
      professionalNumber: 'ONPB-3381',
      phone: '+229 96 22 33 44',
      email: 'haievive@pharma.bj',
      address: 'Boulevard de la Marina',
      area: 'Haie Vive',
      commune: '6e arrondissement',
      city: 'Cotonou',
      latitude: 6.3574,
      longitude: 2.3918,
      distance: 2.4,
      rating: 4.6,
      reviewCount: 15,
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
      id: 'ph-godomey',
      pharmacyName: 'Pharmacie Godomey',
      pharmacistName: 'Mireille Hounkpe',
      professionalNumber: 'ONPB-2290',
      phone: '+229 95 33 44 55',
      email: 'godomey@pharma.bj',
      address: 'Route de Ouidah, Godomey',
      area: 'Togoudo',
      commune: 'Godomey',
      city: 'Abomey-Calavi',
      latitude: 6.3891,
      longitude: 2.3452,
      distance: 8.2,
      rating: 4.4,
      reviewCount: 9,
      open: true,
      delivery: true,
      pickup: true,
      fee: 1200,
      eta: '35-50 min',
      status: 'verified',
      identityStatus: 'verified',
      documents: pharmacyDocs('verified', true),
    },
    {
      id: 'ph-bonanjo',
      pharmacyName: 'Pharmacie Bonanjo',
      pharmacistName: 'Paul Essomba',
      professionalNumber: 'ONPC-1184',
      phone: '+237 670 11 22 33',
      email: 'bonanjo@pharma.cm',
      address: 'Boulevard de la Liberté, Bonanjo',
      area: 'Bonanjo',
      commune: 'Douala I',
      city: 'Douala',
      latitude: 4.0435,
      longitude: 9.6936,
      distance: 1.2,
      rating: 4.7,
      reviewCount: 21,
      open: true,
      delivery: true,
      pickup: true,
      fee: 1000,
      eta: '20-35 min',
      status: 'verified',
      identityStatus: 'verified',
      documents: pharmacyDocs('verified', true),
    },
    {
      id: 'ph-bastos',
      pharmacyName: 'Pharmacie Bastos',
      pharmacistName: 'Marie Ngo',
      professionalNumber: 'ONPC-2209',
      phone: '+237 677 22 33 44',
      email: 'bastos@pharma.cm',
      address: 'Rue 1.770, Bastos',
      area: 'Nlongkak',
      commune: 'Yaoundé I',
      city: 'Yaoundé',
      latitude: 3.8852,
      longitude: 11.5084,
      distance: 2.1,
      rating: 4.6,
      reviewCount: 16,
      open: true,
      delivery: true,
      pickup: true,
      fee: 1200,
      eta: '25-40 min',
      status: 'verified',
      identityStatus: 'verified',
      documents: pharmacyDocs('verified', true),
    },
    {
      id: 'ph-bonamoussadi',
      pharmacyName: 'Pharmacie Bonamoussadi',
      pharmacistName: 'Jean Fotso',
      professionalNumber: 'ONPC-3310',
      phone: '+237 655 33 44 55',
      email: 'bonamoussadi@pharma.cm',
      address: 'Carrefour Bonamoussadi',
      area: 'Bonamoussadi',
      commune: 'Douala III',
      city: 'Douala',
      latitude: 4.0812,
      longitude: 9.7431,
      distance: 4.6,
      rating: 4.5,
      reviewCount: 12,
      open: true,
      delivery: true,
      pickup: true,
      fee: 1000,
      eta: '30-45 min',
      status: 'verified',
      identityStatus: 'verified',
      documents: pharmacyDocs('verified', true),
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
  catalog: centreCatalog([
    ['pc-para', 'paracetamol', 'Paracétamol 500 mg', 'Paracétamol', '500 mg', 'Comprimés', 'Médicaments', 'Douleur et fièvre. Respectez la notice.', false, 'published', 3500, 20, 'paracetamol'],
    ['pc-ibup', 'ibuprofene', 'Ibuprofène 400 mg', 'Ibuprofène', '400 mg', 'Comprimés', 'Médicaments', 'Anti-inflammatoire pour douleurs et fièvre.', false, 'published', 2800, 18, 'paracetamol'],
    ['pc-amox', 'amoxicilline', 'Amoxicilline 500 mg', 'Amoxicilline', '500 mg', 'Gélules', 'Médicaments', 'Antibiotique soumis à ordonnance. Paiement après validation pharmacie.', true, 'published', 6200, 12, 'amoxicillin'],
    ['pc-metf', 'metformine', 'Metformine 1000 mg', 'Metformine', '1000 mg', 'Comprimés', 'Médicaments', 'Traitement du diabète de type 2. Ordonnance obligatoire.', true, 'published', 5400, 10, 'amoxicillin'],
    ['pc-amlo', 'amlodipine', 'Amlodipine 5 mg', 'Amlodipine', '5 mg', 'Comprimés', 'Médicaments', 'Antihypertenseur sur ordonnance.', true, 'published', 4800, 9, 'amoxicillin'],
    ['pc-cipro', 'ciprofloxacine', 'Ciprofloxacine 500 mg', 'Ciprofloxacine', '500 mg', 'Comprimés', 'Médicaments', 'Antibiotique en contrôle avant publication.', true, 'review', 7100, 6, 'amoxicillin'],
    ['pc-vitc', 'vitamine-c', 'Vitamine C 1000 mg', 'Acide ascorbique', '1000 mg', 'Comprimés effervescents', 'Vitamines', 'Complément alimentaire en comprimés effervescents.', false, 'published', 4500, 16, 'vitamin-c'],
    ['pc-vitd', 'vitamine-d', 'Vitamine D3 1000 UI', 'Cholécalciférol', '1000 UI', 'Gélules', 'Vitamines', 'Complément pour le capital osseux.', false, 'published', 5200, 14, 'vitamin-c'],
    ['pc-mag', 'magnesium', 'Magnésium B6', 'Magnésium', 'Boîte de 30', 'Comprimés', 'Vitamines', 'Aide en cas de fatigue et crampes.', false, 'published', 3900, 11, 'vitamin-c'],
    ['pc-bandage', 'pansement', 'Pansements stériles', 'Pansement', 'Boîte de 20', 'Boîte', 'Premiers soins', 'Pansements individuels stériles pour petites plaies.', false, 'published', 2200, 30, 'bandages'],
    ['pc-compresse', 'compresses', 'Compresses stériles', 'Compresse', 'Boîte de 10', 'Boîte', 'Premiers soins', 'Compresses pour nettoyage et protection des plaies.', false, 'published', 1800, 22, 'bandages'],
    ['pc-thermo', 'thermometre', 'Thermomètre digital', 'Thermomètre', '1 unité', 'Appareil', 'Premiers soins', 'Mesure de la température corporelle.', false, 'published', 6500, 8, 'bandages'],
    ['pc-gel', 'gel-hydro', 'Gel hydroalcoolique 100 ml', 'Éthanol', '100 ml', 'Flacon', 'Hygiène', 'Désinfection des mains sans eau.', false, 'published', 1500, 40, 'bandages'],
    ['pc-savon', 'savon-surgras', 'Savon surgras 150 g', 'Savon', '150 g', 'Pain', 'Hygiène', 'Toilette des peaux sensibles.', false, 'published', 1200, 25, 'bandages'],
    ['pc-lait', 'lait-1er-age', 'Lait 1er âge 400 g', 'Lait infantile', '400 g', 'Boîte', 'Bébé', 'Préparation pour nourrissons. Suivez les conseils du pédiatre.', false, 'published', 8900, 7, 'vitamin-c'],
    ['pc-couches', 'couches-t3', 'Couches taille 3', 'Couche', 'Paquet de 40', 'Paquet', 'Bébé', 'Couches absorbantes pour bébé.', false, 'published', 7200, 15, 'bandages'],
    ['pc-serum', 'serum-physio', 'Sérum physiologique', 'NaCl 0,9 %', 'Unidose x 20', 'Unidoses', 'Bébé', 'Lavage du nez et des yeux.', false, 'published', 2100, 19, 'bandages'],
    ['pc-solaire', 'creme-solaire', 'Crème solaire SPF 50', 'Filtres UV', '50 ml', 'Tube', 'Parapharmacie', 'Protection solaire visage et corps.', false, 'published', 7800, 10, 'vitamin-c'],
    ['pc-baume', 'baume-levres', 'Baume à lèvres', 'Cire et beurre de karité', '1 stick', 'Stick', 'Parapharmacie', 'Protège et répare les lèvres sèches.', false, 'published', 900, 28, 'vitamin-c'],
    ['pc-glyco', 'bandelettes-glycemie', 'Bandelettes glycémie', 'Bandelettes', 'Boîte de 50', 'Boîte', 'Diabète', 'Autosurveillance de la glycémie.', false, 'published', 8500, 9, 'bandages'],
    ['pc-preserv', 'preservatifs', 'Préservatifs', 'Latex', 'Boîte de 12', 'Boîte', 'Santé sexuelle', 'Protection lors des rapports sexuels.', false, 'published', 2500, 20, 'bandages'],
  ]).concat(
    officineCatalog('ph-akpakpa', 'Pharmacie Akpakpa', [
      ['pa-para', 'paracetamol', 'Paracétamol 500 mg', 'Paracétamol', '500 mg', 'Comprimés', 'Médicaments', 'Douleur et fièvre. Respectez la notice.', false, 'published', 2800, 18, 'paracetamol'],
      ['pa-amox', 'amoxicilline', 'Amoxicilline 500 mg', 'Amoxicilline', '500 mg', 'Gélules', 'Médicaments', 'Antibiotique soumis à ordonnance.', true, 'published', 5900, 8, 'amoxicillin'],
      ['pa-compresse', 'compresses', 'Compresses stériles', 'Compresse', 'Boîte de 10', 'Boîte', 'Premiers soins', 'Compresses pour nettoyage et protection des plaies.', false, 'published', 1500, 20, 'bandages'],
    ]),
    officineCatalog('ph-haievive', 'Pharmacie Haie Vive', [
      ['phv-para', 'paracetamol', 'Paracétamol 500 mg', 'Paracétamol', '500 mg', 'Comprimés', 'Médicaments', 'Douleur et fièvre. Respectez la notice.', false, 'published', 3200, 14, 'paracetamol'],
      ['phv-vitc', 'vitamine-c', 'Vitamine C 1000 mg', 'Acide ascorbique', '1000 mg', 'Comprimés effervescents', 'Vitamines', 'Complément alimentaire en comprimés effervescents.', false, 'published', 3800, 12, 'vitamin-c'],
    ]),
    officineCatalog('ph-godomey', 'Pharmacie Godomey', [
      ['pg-bandage', 'pansement', 'Pansements stériles', 'Pansement', 'Boîte de 20', 'Boîte', 'Premiers soins', 'Pansements individuels stériles pour petites plaies.', false, 'published', 1900, 16, 'bandages'],
    ]),
    officineCatalog('ph-bonanjo', 'Pharmacie Bonanjo', [
      ['pb-para', 'paracetamol', 'Paracétamol 500 mg', 'Paracétamol', '500 mg', 'Comprimés', 'Médicaments', 'Douleur et fièvre. Respectez la notice.', false, 'published', 2100, 22, 'paracetamol'],
      ['pb-amox', 'amoxicilline', 'Amoxicilline 500 mg', 'Amoxicilline', '500 mg', 'Gélules', 'Médicaments', 'Antibiotique soumis à ordonnance.', true, 'published', 4800, 10, 'amoxicillin'],
    ]),
    officineCatalog('ph-bastos', 'Pharmacie Bastos', [
      ['pba-para', 'paracetamol', 'Paracétamol 500 mg', 'Paracétamol', '500 mg', 'Comprimés', 'Médicaments', 'Douleur et fièvre. Respectez la notice.', false, 'published', 2300, 15, 'paracetamol'],
    ]),
  ),
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
