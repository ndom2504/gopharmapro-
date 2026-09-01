import { catalogDb } from '@/lib/prisma';
import { CatalogError } from '@/lib/catalog/validations';
import type { CustomerProfile } from '@prisma/client';
import { requirePharmacyMatch } from '@/lib/catalog/pharmacyAuth';

const statuses = [
  'PENDING_PRESCRIPTION',
  'PRESCRIPTION_SUBMITTED',
  'PRESCRIPTION_APPROVED',
  'PRESCRIPTION_REJECTED',
] as const;

export function serializePrescription(row: {
  id: string;
  quantity: number;
  documentUrl: string | null;
  status: string;
  note: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  product: { id: string; name: string; requiresPrescription: boolean };
  pharmacy: { id: string; name: string; accountId: string | null };
  customer: { id: string; accountId: string };
}) {
  return {
    id: row.id,
    customerId: row.customer.id,
    accountId: row.customer.accountId,
    pharmacyId: row.pharmacy.id,
    productId: row.product.id,
    productName: row.product.name,
    pharmacyName: row.pharmacy.name,
    quantity: row.quantity,
    documentUrl: row.documentUrl,
    prescriptionUrl: row.documentUrl,
    status: row.status,
    prescriptionStatus: row.status,
    note: row.note,
    prescriptionNote: row.note,
    reviewedAt: row.reviewedAt?.toISOString() || null,
    reviewedBy: row.reviewedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    canPay: row.status === 'PRESCRIPTION_APPROVED',
  };
}

const include = {
  product: true,
  pharmacy: true,
  customer: true,
} as const;

export async function createPrescription(input: {
  customer: CustomerProfile;
  pharmacyId: string;
  productId: string;
  quantity?: number;
  documentUrl?: string | null;
}) {
  const db = catalogDb();
  const pharmacy = await db.pharmacy.findFirst({
    where: { OR: [{ id: input.pharmacyId }, { accountId: input.pharmacyId }], active: true },
  });
  if (!pharmacy) throw new CatalogError(404, 'Pharmacie introuvable.');
  const product = await db.product.findUnique({
    where: { id: input.productId },
    include: { countryStatuses: { where: { countryId: pharmacy.countryId } } },
  });
  if (!product || !product.active) throw new CatalogError(404, 'Produit inexistant.');
  const pc = product.countryStatuses[0];
  if (!pc?.active) throw new CatalogError(400, 'Ce produit n’est pas disponible dans le pays de la pharmacie.');
  const requires = pc.requiresPrescription ?? product.requiresPrescription;
  if (!requires) throw new CatalogError(400, 'Ce produit ne nécessite pas d’ordonnance.');
  const qty = input.quantity && input.quantity > 0 ? Math.floor(input.quantity) : 1;
  const documentUrl = input.documentUrl?.trim() || null;
  if (documentUrl && documentUrl.length > 1_800_000) throw new CatalogError(400, 'Ordonnance trop volumineuse.');
  return db.prescriptionRequest.create({
    data: {
      customerId: input.customer.id,
      pharmacyId: pharmacy.id,
      productId: product.id,
      quantity: qty,
      documentUrl,
      status: documentUrl ? 'PRESCRIPTION_SUBMITTED' : 'PENDING_PRESCRIPTION',
    },
    include,
  });
}

export async function getPrescriptionForActor(id: string, actor: { customerId?: string; pharmacyId?: string; admin?: boolean }) {
  const row = await catalogDb().prescriptionRequest.findUnique({ where: { id }, include });
  if (!row) throw new CatalogError(404, 'Demande introuvable.');
  if (actor.admin) return row;
  if (actor.customerId && row.customerId === actor.customerId) return row;
  if (actor.pharmacyId && row.pharmacyId === actor.pharmacyId) return row;
  throw new CatalogError(403, 'Accès refusé.');
}

export async function listPrescriptionsForCustomer(customerId: string) {
  return catalogDb().prescriptionRequest.findMany({
    where: { customerId },
    include,
    orderBy: { createdAt: 'desc' },
  });
}

export async function listPrescriptionsForPharmacy(pharmacyId: string) {
  return catalogDb().prescriptionRequest.findMany({
    where: { pharmacyId },
    include,
    orderBy: { createdAt: 'desc' },
  });
}

export async function submitPrescription(id: string, customerId: string, documentUrl: string) {
  const url = documentUrl.trim();
  if (!url) throw new CatalogError(400, 'Ordonnance requise.');
  if (url.length > 1_800_000) throw new CatalogError(400, 'Ordonnance trop volumineuse.');
  const row = await getPrescriptionForActor(id, { customerId });
  if (row.status === 'PRESCRIPTION_APPROVED') throw new CatalogError(400, 'Cette demande est déjà validée.');
  return catalogDb().prescriptionRequest.update({
    where: { id: row.id },
    data: { documentUrl: url, status: 'PRESCRIPTION_SUBMITTED', note: null },
    include,
  });
}

export async function applyPrescriptionReview(
  pharmacy: { id: string; accountId: string | null },
  id: string,
  decision: 'approve' | 'reject',
  note?: string | null,
) {
  const row = await getPrescriptionForActor(id, { pharmacyId: pharmacy.id });
  if (row.status !== 'PRESCRIPTION_SUBMITTED' && row.status !== 'PENDING_PRESCRIPTION') {
    throw new CatalogError(400, 'Cette demande n’est plus en attente.');
  }
  if (decision === 'reject' && !String(note || '').trim()) {
    throw new CatalogError(400, 'Un motif de refus est requis.');
  }
  return catalogDb().prescriptionRequest.update({
    where: { id: row.id },
    data: {
      status: decision === 'approve' ? 'PRESCRIPTION_APPROVED' : 'PRESCRIPTION_REJECTED',
      note: decision === 'reject' ? String(note).trim() : null,
      reviewedAt: new Date(),
      reviewedBy: pharmacy.accountId || pharmacy.id,
    },
    include,
  });
}

export async function reviewPrescription(id: string, pharmacyKey: string, decision: 'approve' | 'reject', note?: string | null) {
  const pharmacy = await requirePharmacyMatch(pharmacyKey);
  return applyPrescriptionReview(pharmacy, id, decision, note);
}

export function isPrescriptionStatus(value: string) {
  return statuses.includes(value as (typeof statuses)[number]);
}
