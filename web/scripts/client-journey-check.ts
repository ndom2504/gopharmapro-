import { catalogDb } from '../lib/prisma';
import { searchClientOffers, getClientOffer } from '../lib/client/search';
import { upsertClientProfile } from '../lib/client/auth';
import { applyPrescriptionReview, createPrescription, submitPrescription } from '../lib/client/prescriptions';
import { CatalogError, kmBetween } from '../lib/catalog/validations';

function ok(name: string) {
  console.log('ok  ' + name);
}

function fail(name: string, err: unknown) {
  console.error('fail  ' + name + ' — ' + (err instanceof Error ? err.message : err));
  process.exitCode = 1;
}

async function expectStatus(name: string, fn: () => Promise<unknown>, status: number) {
  try {
    await fn();
    fail(name, 'aucune erreur');
  } catch (err) {
    if (err instanceof CatalogError && err.status === status) ok(name);
    else fail(name, err);
  }
}

async function main() {
  const db = catalogDb();
  let rxId = '';
  try {
    const gabon = await searchClientOffers({ country: 'GA', search: 'paracetamol', sort: 'relevance' });
    if (!gabon.results.some((r) => /parac[eé]tamol/i.test(`${r.product.name} ${r.product.genericName || ''}`))) {
      throw new Error('paracétamol absent');
    }
    ok('recherche Paracétamol Gabon');

    const byCat = await searchClientOffers({ country: 'GA', category: 'Douleur et fièvre' });
    if (!byCat.results.length) throw new Error('filtre catégorie vide');
    ok('recherche catégorie');

    const first = gabon.results[0];
    if (!first.pharmacy.name || first.offer.price <= 0) throw new Error('prix/pharmacie');
    ok('affichage pharmacies / prix');
    if (first.offer.stockQuantity <= 0) throw new Error('stock');
    ok('affichage stock');
    if (typeof first.offer.deliveryAvailable !== 'boolean' || typeof first.offer.pickupAvailable !== 'boolean') {
      throw new Error('options');
    }
    ok('livraison / retrait');

    const d = kmBetween({ latitude: 0.4162, longitude: 9.4673 }, { latitude: 0.3901, longitude: 9.4544 });
    if (d <= 0 || d > 20) throw new Error('haversine ' + d);
    const near = await searchClientOffers({
      country: 'GA',
      search: 'paracetamol',
      latitude: 0.4162,
      longitude: 9.4673,
      sort: 'nearest',
    });
    if (near.results[0] && near.results[0].distanceKm == null) throw new Error('distance absente');
    ok('calcul de distance');

    const palmiers = await db.pharmacy.findUnique({ where: { accountId: 'ph-palmiers' } });
    if (palmiers && gabon.results.some((r) => r.pharmacy.id === palmiers.id)) {
      throw new Error('pharmacie non vérifiée visible');
    }
    ok('pharmacie inactive / non vérifiée masquée');

    await db.pharmacyProduct.updateMany({
      where: { pharmacy: { accountId: 'ph-centre' }, product: { slug: 'paracetamol-500-mg-comprime' } },
      data: { available: false },
    });
    const hidden = await searchClientOffers({ country: 'GA', search: 'paracetamol-500-mg-comprime' });
    const still = hidden.results.some((r) => r.product.name.toLowerCase().includes('paracétamol 500') || r.product.name.toLowerCase().includes('paracetamol 500'));
    await db.pharmacyProduct.updateMany({
      where: { pharmacy: { accountId: 'ph-centre' }, product: { slug: 'paracetamol-500-mg-comprime' } },
      data: { available: true },
    });
    if (still) throw new Error('produit indisponible encore visible');
    ok('produit indisponible masqué');

    const rxHits = await searchClientOffers({ country: 'GA', search: 'amoxicilline' });
    const rxRow = rxHits.results.find((r) => r.product.requiresPrescription);
    if (!rxRow) throw new Error('produit ordonnance manquant');
    ok('produit sur ordonnance');

    const profile = await upsertClientProfile({ accountId: 'c-awa', country: 'GA', city: 'Libreville' });
    const created = await createPrescription({
      customer: profile,
      pharmacyId: rxRow.pharmacy.id,
      productId: rxRow.product.id,
      quantity: 1,
    });
    rxId = created.id;
    if (created.status !== 'PENDING_PRESCRIPTION') throw new Error('statut initial');
    const submitted = await submitPrescription(created.id, profile.id, 'data:image/png;base64,aaa');
    if (submitted.status !== 'PRESCRIPTION_SUBMITTED') throw new Error('soumission');
    ok('upload ordonnance');

    const pharmacy = await db.pharmacy.findUniqueOrThrow({ where: { id: rxRow.pharmacy.id } });
    const approved = await applyPrescriptionReview(pharmacy, created.id, 'approve');
    if (approved.status !== 'PRESCRIPTION_APPROVED' || !serializeOk(approved.status)) throw new Error('approbation');
    ok('validation ordonnance');

    const second = await createPrescription({
      customer: profile,
      pharmacyId: rxRow.pharmacy.id,
      productId: rxRow.product.id,
      documentUrl: 'data:image/png;base64,bbb',
    });
    const rejected = await applyPrescriptionReview(pharmacy, second.id, 'reject', 'Document illisible');
    if (rejected.status !== 'PRESCRIPTION_REJECTED') throw new Error('refus');
    ok('refus ordonnance');
    await db.prescriptionRequest.delete({ where: { id: second.id } }).catch(() => undefined);

    await expectStatus('offre inexistante', () => getClientOffer('missing', 'missing'), 404);
    ok('protection API 404');
  } catch (err) {
    fail('parcours client', err);
  } finally {
    if (rxId) await catalogDb().prescriptionRequest.delete({ where: { id: rxId } }).catch(() => undefined);
  }
}

function serializeOk(status: string) {
  return status === 'PRESCRIPTION_APPROVED';
}

main().then(() => {
  console.log(process.exitCode ? 'client-journey-check: échecs' : 'client-journey-check: ok');
});
