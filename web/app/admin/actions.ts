'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/adminAuth';
import {
  setCatalogStatus,
  setCourierStatus,
  setDocumentStatus,
  setPharmacyStatus,
  markPayoutSent,
  type CatalogStatus,
  type CourierStatus,
  type DocStatus,
} from '@/lib/adminData';

function refresh() {
  revalidatePath('/admin', 'layout');
  revalidatePath('/');
  revalidatePath('/produits');
  revalidatePath('/pharmacies');
  revalidatePath('/api/v1/catalog');
}

export async function approvePharmacy(id: string) {
  await requireAdmin();
  setPharmacyStatus(id, 'verified');
  refresh();
}

export async function rejectPharmacy(id: string) {
  await requireAdmin();
  setPharmacyStatus(id, 'rejected');
  refresh();
}

export async function setPharmacyDoc(id: string, key: string, status: DocStatus) {
  await requireAdmin();
  setDocumentStatus(id, key, status);
  refresh();
}

export async function setCourier(id: string, status: CourierStatus) {
  await requireAdmin();
  setCourierStatus(id, status);
  refresh();
}

export async function setCourierDoc(id: string, key: string, status: DocStatus) {
  await requireAdmin();
  setDocumentStatus(id, key, status);
  refresh();
}

export async function setProductStatus(id: string, status: CatalogStatus) {
  await requireAdmin();
  setCatalogStatus(id, status);
  refresh();
}

export async function sendPayout(id: string) {
  await requireAdmin();
  markPayoutSent(id);
  refresh();
}
