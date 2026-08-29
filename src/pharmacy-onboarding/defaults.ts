import {
  ManagerRole,
  OpeningDay,
  PharmacyAccount,
  PharmacyDocument,
  StructureType,
  Weekday,
} from '../types';
import { LIBREVILLE } from '../lib/geo';

export const WEEKDAYS: { id: Weekday; label: string }[] = [
  { id: 'lundi', label: 'Lundi' },
  { id: 'mardi', label: 'Mardi' },
  { id: 'mercredi', label: 'Mercredi' },
  { id: 'jeudi', label: 'Jeudi' },
  { id: 'vendredi', label: 'Vendredi' },
  { id: 'samedi', label: 'Samedi' },
  { id: 'dimanche', label: 'Dimanche' },
];

export function defaultHours(): Record<Weekday, OpeningDay> {
  const week: OpeningDay = { closed: false, open: '08:00', close: '20:00' };
  return {
    lundi: { ...week },
    mardi: { ...week },
    mercredi: { ...week },
    jeudi: { ...week },
    vendredi: { ...week },
    samedi: { closed: false, open: '08:00', close: '18:00' },
    dimanche: { closed: true, open: '08:00', close: '12:00' },
  };
}

export const requiredDocuments: Omit<PharmacyDocument, 'status'>[] = [
  { key: 'authorization', label: 'Document d’autorisation / agrément', required: true },
  { key: 'identification', label: 'Document d’identification de la structure', required: true },
  { key: 'manager', label: 'Justificatif du responsable', required: true },
  { key: 'professional', label: 'Document professionnel du pharmacien responsable', required: true },
  { key: 'other', label: 'Autres documents requis', required: false },
];

export function emptyDocuments(): PharmacyDocument[] {
  return requiredDocuments.map((d) => ({ ...d, status: 'pending' as const }));
}

export const structureOptions: { id: StructureType; label: string }[] = [
  { id: 'officine', label: 'Pharmacie d’officine' },
  { id: 'other', label: 'Autre' },
];

export const managerRoleOptions: { id: ManagerRole; label: string }[] = [
  { id: 'titulaire', label: 'Pharmacien titulaire' },
  { id: 'gerant', label: 'Gérant' },
  { id: 'responsable', label: 'Responsable de la pharmacie' },
  { id: 'other', label: 'Autre' },
];

export type PharmacyForm = Omit<PharmacyAccount, 'id' | 'role' | 'status' | 'visibleOnMarketplace' | 'pharmacistName'> & {
  password: string;
  confirm: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

export function emptyPharmacyForm(): PharmacyForm {
  return {
    pharmacyName: '',
    tradeName: '',
    structureType: 'officine',
    structureTypeOther: '',
    authorizationNumber: '',
    structureIdNumber: '',
    phone: '',
    email: '',
    phoneSecondary: '',
    website: '',
    managerFirstName: '',
    managerLastName: '',
    managerRole: 'titulaire',
    managerRoleOther: '',
    managerPhone: '',
    managerEmail: '',
    professionalNumber: '',
    country: 'GA',
    province: 'Estuaire',
    city: 'Libreville',
    commune: 'Libreville',
    area: '',
    address: '',
    landmark: '',
    latitude: LIBREVILLE.latitude,
    longitude: LIBREVILLE.longitude,
    gpsConfirmed: false,
    hours: defaultHours(),
    open24h: false,
    nightDuty: false,
    services: {
      onlineOrder: true,
      pickup: true,
      delivery: true,
      prescription: true,
      parapharmacy: true,
      health: true,
    },
    deliveryRadiusKm: '8',
    deliveryZones: '',
    deliveryFee: '1000',
    freeDeliveryFrom: '25000',
    deliveryEta: '30-45 min',
    documents: emptyDocuments(),
    password: '',
    confirm: '',
    termsAccepted: false,
    privacyAccepted: false,
  };
}

export function toPharmacyAccount(form: PharmacyForm, id: string, status: PharmacyAccount['status']): PharmacyAccount {
  return {
    role: 'pharmacy',
    id,
    pharmacyName: form.pharmacyName.trim(),
    tradeName: form.tradeName.trim(),
    structureType: form.structureType,
    structureTypeOther: form.structureTypeOther.trim(),
    authorizationNumber: form.authorizationNumber.trim(),
    structureIdNumber: form.structureIdNumber.trim(),
    phone: form.phone,
    email: form.email.trim().toLowerCase(),
    phoneSecondary: form.phoneSecondary,
    website: form.website.trim(),
    managerFirstName: form.managerFirstName.trim(),
    managerLastName: form.managerLastName.trim(),
    managerRole: form.managerRole,
    managerRoleOther: form.managerRoleOther.trim(),
    managerPhone: form.managerPhone,
    managerEmail: form.managerEmail.trim().toLowerCase(),
    professionalNumber: form.professionalNumber.trim(),
    pharmacistName: `${form.managerFirstName.trim()} ${form.managerLastName.trim()}`.trim(),
    country: form.country || 'GA',
    province: form.province,
    city: form.city,
    commune: form.commune,
    area: form.area,
    address: form.address.trim(),
    landmark: form.landmark.trim(),
    latitude: form.latitude,
    longitude: form.longitude,
    gpsConfirmed: form.gpsConfirmed,
    hours: form.hours,
    open24h: form.open24h,
    nightDuty: form.nightDuty,
    services: form.services,
    deliveryRadiusKm: form.deliveryRadiusKm.trim(),
    deliveryZones: form.deliveryZones.trim(),
    deliveryFee: form.deliveryFee.trim(),
    freeDeliveryFrom: form.freeDeliveryFrom.trim(),
    deliveryEta: form.deliveryEta.trim(),
    documents: form.documents,
    status,
    visibleOnMarketplace: status === 'verified',
  };
}

export function demoOwendoPharmacy(): PharmacyAccount {
  const form = emptyPharmacyForm();
  return toPharmacyAccount(
    {
      ...form,
      pharmacyName: 'Pharmacie des Palmiers',
      authorizationNumber: 'MS/2024/PH-092',
      structureIdNumber: 'NIF-241088',
      phone: '+241 77 22 33 44',
      email: 'palmiers@pharma.ga',
      managerFirstName: 'Léa',
      managerLastName: 'Obiang',
      managerPhone: '+241 77 22 33 44',
      managerEmail: 'palmiers@pharma.ga',
      professionalNumber: 'ONPG-2201',
      area: 'Owendo',
      commune: 'Owendo',
      city: 'Libreville',
      address: 'Route de la gare d’Owendo',
      landmark: 'Près du marché',
      gpsConfirmed: true,
      documents: emptyDocuments().map((d) => ({
        ...d,
        fileName: d.required ? d.key + '.pdf' : undefined,
        status: 'pending' as const,
      })),
    },
    'ph-palmiers',
    'pending',
  );
}

export function demoCentrePharmacy(): PharmacyAccount {
  const form = emptyPharmacyForm();
  return toPharmacyAccount(
    {
      ...form,
      pharmacyName: 'Pharmacie du Centre',
      tradeName: '',
      authorizationNumber: 'MS/2021/PH-184',
      structureIdNumber: 'NIF-241001',
      phone: '+241 77 11 22 33',
      email: 'centre@pharma.ga',
      managerFirstName: 'Ndong',
      managerLastName: 'Mba',
      managerPhone: '+241 77 11 22 33',
      managerEmail: 'centre@pharma.ga',
      professionalNumber: 'ONPG-1284',
      area: 'Centre-ville',
      address: 'Boulevard de l’Indépendance',
      landmark: 'Face à la poste',
      gpsConfirmed: true,
      documents: emptyDocuments().map((d) => ({ ...d, fileName: d.key + '.pdf', status: 'verified' as const })),
    },
    'ph-centre',
    'verified',
  );
}
