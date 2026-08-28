import { CourierAccount, CourierVehicle, PharmacyDocument } from '../types';

export const courierDocuments: Omit<PharmacyDocument, 'status'>[] = [
  { key: 'idCard', label: 'Pièce d’identité (CNI ou passeport)', required: true },
  { key: 'license', label: 'Permis de conduire', required: true },
  { key: 'vehicle', label: 'Carte grise ou assurance du véhicule', required: true },
  { key: 'photo', label: 'Photo du livreur (optionnel)', required: false },
];

export function emptyCourierDocuments(): PharmacyDocument[] {
  return courierDocuments.map((d) => ({ ...d, status: 'pending' as const }));
}

export const vehicleOptions: { id: CourierVehicle; label: string }[] = [
  { id: 'moto', label: 'Moto' },
  { id: 'voiture', label: 'Voiture' },
  { id: 'other', label: 'Autre' },
];

export type CourierForm = Omit<CourierAccount, 'id' | 'role' | 'status' | 'provider' | 'googleId'> & {
  password: string;
  confirm: string;
  termsAccepted: boolean;
};

export function emptyCourierForm(): CourierForm {
  return {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    vehicle: 'moto',
    vehicleOther: '',
    plate: '',
    payoutPhone: '',
    province: 'Estuaire',
    city: 'Libreville',
    commune: 'Libreville',
    area: '',
    zones: '',
    documents: emptyCourierDocuments(),
    password: '',
    confirm: '',
    termsAccepted: false,
  };
}

export function toCourierAccount(
  form: CourierForm,
  id: string,
  extras?: Partial<Pick<CourierAccount, 'provider' | 'googleId' | 'status'>>,
): CourierAccount {
  return {
    role: 'courier',
    id,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phone: form.phone,
    email: form.email.trim().toLowerCase(),
    provider: extras?.provider || 'password',
    googleId: extras?.googleId,
    vehicle: form.vehicle,
    vehicleOther: form.vehicleOther.trim(),
    plate: form.plate.trim().toUpperCase(),
    payoutPhone: form.payoutPhone || form.phone,
    province: form.province,
    city: form.city,
    commune: form.commune,
    area: form.area,
    zones: form.zones.trim(),
    documents: form.documents,
    status: extras?.status || 'pending',
  };
}

export function emptyCourierAccount(id: string, patch: Partial<CourierAccount> = {}): CourierAccount {
  const form = emptyCourierForm();
  return {
    ...toCourierAccount(form, id),
    ...patch,
    documents: patch.documents?.length ? patch.documents : emptyCourierDocuments(),
  };
}
