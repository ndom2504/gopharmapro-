import { PrismaClient, ProductCountryStatus } from '@prisma/client';

const prisma = new PrismaClient();

const gabonCategories = [
  'Douleur et fièvre',
  'Antipaludiques',
  'Antibiotiques',
  'Allergies',
  'Gastro-entérologie',
  'Cardiologie',
  'Diabète',
  'Hypertension',
  'Respiratoire',
  'Dermatologie',
  'Ophtalmologie',
  'ORL',
  'Vitamines et minéraux',
  'Santé digestive',
  'Santé féminine',
  'Santé masculine',
  'Pédiatrie',
  'Antiseptiques et désinfectants',
  'Premiers soins',
  'Dispositifs médicaux',
  'Hygiène et soins',
  'Autres produits de santé',
];

const catalogCategories = [
  'Médicaments',
  'Médicaments sur ordonnance',
  'Antalgiques',
  'Antibiotiques',
  'Antipaludiques',
  'Anti-inflammatoires',
  'Gastro-entérologie',
  'Dermatologie',
  'Santé respiratoire',
  'Vitamines et compléments',
  'Santé maternelle',
  'Santé infantile',
  'Hygiène et soins',
  'Dispositifs médicaux',
  'Premiers soins',
  'Produits de santé',
];

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const gabon = await prisma.country.upsert({
    where: { code: 'GA' },
    update: { name: 'Gabon', currency: 'XAF', currencySymbol: 'FCFA', active: true },
    create: { code: 'GA', name: 'Gabon', currency: 'XAF', currencySymbol: 'FCFA', active: true },
  });

  const benin = await prisma.country.upsert({
    where: { code: 'BJ' },
    update: { name: 'Bénin', currency: 'XOF', currencySymbol: 'FCFA', active: true },
    create: { code: 'BJ', name: 'Bénin', currency: 'XOF', currencySymbol: 'FCFA', active: true },
  });
  const cameroon = await prisma.country.upsert({
    where: { code: 'CM' },
    update: { name: 'Cameroun', currency: 'XAF', currencySymbol: 'FCFA', active: true },
    create: { code: 'CM', name: 'Cameroun', currency: 'XAF', currencySymbol: 'FCFA', active: true },
  });

  const categoryIds: Record<string, string> = {};
  for (const [i, name] of gabonCategories.entries()) {
    const slug = slugify(name);
    const row = await prisma.category.upsert({
      where: { countryId_slug: { countryId: gabon.id, slug } },
      update: { name, active: true, sortOrder: i + 1 },
      create: {
        countryId: gabon.id,
        name,
        slug,
        description: 'Structure commerciale initiale du catalogue. Ce n’est pas une classification réglementaire officielle.',
        active: true,
        sortOrder: i + 1,
      },
    });
    categoryIds[name] = row.id;
  }

  const categoryNote =
    'Structure commerciale du catalogue. Ce n’est pas une classification réglementaire officielle.';
  for (const country of [gabon, benin, cameroon]) {
    for (const [i, name] of catalogCategories.entries()) {
      const slug = slugify(name);
      await prisma.category.upsert({
        where: { countryId_slug: { countryId: country.id, slug } },
        update: { name, active: true },
        create: {
          countryId: country.id,
          name,
          slug,
          description: categoryNote,
          active: true,
          sortOrder: country.code === 'GA' ? 40 + i : i + 1,
        },
      });
    }
  }

  const demoProducts = [
    {
      name: 'Paracétamol 500 mg comprimé',
      genericName: 'Paracétamol',
      activeIngredient: 'Paracétamol',
      dosage: '500',
      dosageUnit: 'mg',
      pharmaceuticalForm: 'Comprimé',
      packaging: 'Boîte',
      category: 'Douleur et fièvre',
      requiresPrescription: false,
    },
    {
      name: 'Paracétamol 1 g comprimé',
      genericName: 'Paracétamol',
      activeIngredient: 'Paracétamol',
      dosage: '1000',
      dosageUnit: 'mg',
      pharmaceuticalForm: 'Comprimé',
      packaging: 'Boîte',
      category: 'Douleur et fièvre',
      requiresPrescription: false,
    },
    {
      name: 'Ibuprofène 400 mg comprimé',
      genericName: 'Ibuprofène',
      activeIngredient: 'Ibuprofène',
      dosage: '400',
      dosageUnit: 'mg',
      pharmaceuticalForm: 'Comprimé',
      packaging: 'Boîte',
      category: 'Douleur et fièvre',
      requiresPrescription: false,
    },
    {
      name: 'Solution antiseptique',
      genericName: null,
      activeIngredient: null,
      dosage: null,
      dosageUnit: null,
      pharmaceuticalForm: 'Solution',
      packaging: 'Flacon',
      category: 'Antiseptiques et désinfectants',
      requiresPrescription: false,
    },
    {
      name: 'Sérum physiologique',
      genericName: 'Chlorure de sodium 0,9 %',
      activeIngredient: 'Chlorure de sodium',
      dosage: '0.9',
      dosageUnit: '%',
      pharmaceuticalForm: 'Solution',
      packaging: 'Unidoses',
      category: 'Pédiatrie',
      requiresPrescription: false,
    },
    {
      name: 'Thermomètre médical',
      genericName: null,
      activeIngredient: null,
      dosage: null,
      dosageUnit: null,
      pharmaceuticalForm: 'Dispositif',
      packaging: 'Unité',
      category: 'Dispositifs médicaux',
      requiresPrescription: false,
    },
    {
      name: 'Pansements',
      genericName: null,
      activeIngredient: null,
      dosage: null,
      dosageUnit: null,
      pharmaceuticalForm: 'Pansement',
      packaging: 'Boîte',
      category: 'Premiers soins',
      requiresPrescription: false,
    },
    {
      name: 'Compresses stériles',
      genericName: null,
      activeIngredient: null,
      dosage: null,
      dosageUnit: null,
      pharmaceuticalForm: 'Compresse',
      packaging: 'Sachet',
      category: 'Premiers soins',
      requiresPrescription: false,
    },
  ];

  for (const item of demoProducts) {
    const slug = slugify(item.name);
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        name: item.name,
        genericName: item.genericName,
        activeIngredient: item.activeIngredient,
        dosage: item.dosage,
        dosageUnit: item.dosageUnit,
        pharmaceuticalForm: item.pharmaceuticalForm,
        packaging: item.packaging,
        categoryId: categoryIds[item.category],
        requiresPrescription: item.requiresPrescription,
        description:
          'Fiche de démonstration du catalogue Gopharmapro. Aucun numéro d’autorisation, prix officiel ni statut réglementaire n’est affirmé.',
        active: true,
      },
      create: {
        slug,
        name: item.name,
        genericName: item.genericName,
        activeIngredient: item.activeIngredient,
        dosage: item.dosage,
        dosageUnit: item.dosageUnit,
        pharmaceuticalForm: item.pharmaceuticalForm,
        packaging: item.packaging,
        categoryId: categoryIds[item.category],
        requiresPrescription: item.requiresPrescription,
        description:
          'Fiche de démonstration du catalogue Gopharmapro. Aucun numéro d’autorisation, prix officiel ni statut réglementaire n’est affirmé.',
        active: true,
      },
    });
    await prisma.productCountry.upsert({
      where: { productId_countryId: { productId: product.id, countryId: gabon.id } },
      update: {},
      create: {
        productId: product.id,
        countryId: gabon.id,
        status: ProductCountryStatus.UNKNOWN,
        requiresPrescription: item.requiresPrescription,
        verified: false,
        active: true,
        regulatoryNote: 'Statut non vérifié. À valider par un administrateur ou un professionnel autorisé.',
      },
    });
  }

  const centre = await prisma.pharmacy.upsert({
    where: { accountId: 'ph-centre' },
    update: {
      name: 'Pharmacie du Centre',
      legalName: 'Pharmacie du Centre SARL',
      email: 'centre@pharma.ga',
      city: 'Libreville',
      countryId: gabon.id,
      active: true,
      verified: true,
    },
    create: {
      accountId: 'ph-centre',
      name: 'Pharmacie du Centre',
      legalName: 'Pharmacie du Centre SARL',
      email: 'centre@pharma.ga',
      phone: '+241 77 11 22 33',
      address: 'Boulevard de l’Indépendance',
      city: 'Libreville',
      countryId: gabon.id,
      latitude: 0.3901,
      longitude: 9.4544,
      active: true,
      verified: true,
    },
  });
  await prisma.pharmacy.upsert({
    where: { accountId: 'ph-palmiers' },
    update: {
      name: 'Pharmacie des Palmiers',
      legalName: 'Pharmacie des Palmiers',
      email: 'palmiers@pharma.ga',
      city: 'Libreville',
      countryId: gabon.id,
      active: true,
      verified: false,
    },
    create: {
      accountId: 'ph-palmiers',
      name: 'Pharmacie des Palmiers',
      legalName: 'Pharmacie des Palmiers',
      email: 'palmiers@pharma.ga',
      phone: '+241 77 22 33 44',
      address: 'Route de la gare d’Owendo',
      city: 'Libreville',
      countryId: gabon.id,
      latitude: 0.3482,
      longitude: 9.5041,
      active: true,
      verified: false,
    },
  });

  const para = await prisma.product.findUnique({ where: { slug: 'paracetamol-500-mg-comprime' } });
  if (para) {
    await prisma.pharmacyProduct.upsert({
      where: { pharmacyId_productId: { pharmacyId: centre.id, productId: para.id } },
      update: {},
      create: {
        pharmacyId: centre.id,
        productId: para.id,
        price: 1500,
        currency: 'XAF',
        stockQuantity: 20,
        available: true,
        deliveryAvailable: true,
        pickupAvailable: true,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
