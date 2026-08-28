export type Coords = { latitude: number; longitude: number };

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

export type CartItem = { product: Product; offer: Offer; quantity: number };

export type PaymentMethodId = 'mobicash' | 'airtel-money' | 'moov-money';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type OrderStatus = 'paid' | 'preparing' | 'ready' | 'delivered';

export type OrderPayment = {
  method: PaymentMethodId;
  methodLabel: string;
  phone: string;
  status: PaymentStatus;
  reference: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  pharmacyName: string;
  eta: string;
  subtotal: number;
  fee: number;
  total: number;
  payment: OrderPayment;
  deliveryAddress: string;
  status: OrderStatus;
  createdAt: string;
};

export type UserRole = 'client' | 'pharmacy';

export type ClientAccount = {
  role: 'client';
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  provider: 'password' | 'google';
  googleId?: string;
};

export type StructureType = 'officine' | 'other';
export type ManagerRole = 'titulaire' | 'gerant' | 'responsable' | 'other';
export type DocumentStatus = 'pending' | 'verified' | 'rejected';
export type PharmacyStatus = 'pending' | 'verified' | 'rejected';

export type OpeningDay = { closed: boolean; open: string; close: string };
export type Weekday = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export type PharmacyDocument = {
  key: string;
  label: string;
  required: boolean;
  fileName?: string;
  status: DocumentStatus;
};

export type PharmacyServices = {
  onlineOrder: boolean;
  pickup: boolean;
  delivery: boolean;
  prescription: boolean;
  parapharmacy: boolean;
  health: boolean;
};

export type PharmacyAccount = {
  role: 'pharmacy';
  id: string;
  pharmacyName: string;
  tradeName: string;
  structureType: StructureType;
  structureTypeOther: string;
  authorizationNumber: string;
  structureIdNumber: string;
  phone: string;
  email: string;
  phoneSecondary: string;
  website: string;
  managerFirstName: string;
  managerLastName: string;
  managerRole: ManagerRole;
  managerRoleOther: string;
  managerPhone: string;
  managerEmail: string;
  professionalNumber: string;
  pharmacistName: string;
  province: string;
  city: string;
  commune: string;
  area: string;
  address: string;
  landmark: string;
  latitude: number;
  longitude: number;
  gpsConfirmed: boolean;
  hours: Record<Weekday, OpeningDay>;
  open24h: boolean;
  nightDuty: boolean;
  services: PharmacyServices;
  deliveryRadiusKm: string;
  deliveryZones: string;
  deliveryFee: string;
  freeDeliveryFrom: string;
  deliveryEta: string;
  documents: PharmacyDocument[];
  status: PharmacyStatus;
  visibleOnMarketplace: boolean;
};

export type Session = ClientAccount | PharmacyAccount;

