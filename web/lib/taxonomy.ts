export type RegulatoryStatus = 'otc' | 'rx' | 'controlled';

export const regulatoryStatuses: { id: RegulatoryStatus; label: string; short: string }[] = [
  { id: 'otc', label: 'Sans ordonnance', short: 'Sans ordonnance' },
  { id: 'rx', label: 'Sur ordonnance', short: 'Sur ordonnance' },
  { id: 'controlled', label: 'Contrôle requis', short: 'Contrôle requis' },
];

export const catalogTree: { name: string; icon: string; photo: string; subs: string[] }[] = [
  {
    name: 'Médicaments',
    icon: '💊',
    photo: 'medicaments',
    subs: [
      'Antalgiques & fièvre',
      'Anti-infectieux',
      'Antipaludiques',
      'Cardiologie',
      'Diabète',
      'Gastro-entérologie',
      'Respiratoire',
      'Allergies',
      'Neurologie',
      'Dermatologie',
    ],
  },
  {
    name: 'Maman & Bébé',
    icon: '👶',
    photo: 'bebe',
    subs: ['Grossesse', 'Allaitement', 'Lait infantile', 'Couches & hygiène', 'Soins bébé', 'Fièvre enfant'],
  },
  {
    name: 'Premiers soins',
    icon: '🩹',
    photo: 'premiers-soins',
    subs: ['Pansements & compresses', 'Désinfection', 'Brûlures', 'Urgence', 'Thermomètres'],
  },
  {
    name: 'Hygiène & Soins',
    icon: '🧴',
    photo: 'hygiene',
    subs: ['Hygiène corporelle', 'Bucco-dentaire', 'Hygiène intime', 'Cheveux', 'Mains'],
  },
  {
    name: 'Dermatologie',
    icon: '✨',
    photo: 'parapharmacie',
    subs: ['Acné', 'Peau sèche', 'Eczéma', 'Protection solaire', 'Cicatrisation'],
  },
  {
    name: 'Vitamines & Nutrition',
    icon: '💪',
    photo: 'vitamines',
    subs: ['Vitamines', 'Minéraux', 'Tonus & immunité', 'Nutrition sportive'],
  },
  {
    name: 'Matériel médical',
    icon: '🩺',
    photo: 'premiers-soins',
    subs: ['Autosurveillance', 'Orthopédie', 'Aides techniques', 'Injections'],
  },
  {
    name: 'Diabète',
    icon: '🩸',
    photo: 'medicaments',
    subs: ['Glycémie', 'Traitements', 'Nutrition diabète', 'Pieds & plaies'],
  },
  {
    name: 'Santé sexuelle',
    icon: '❤️',
    photo: 'parapharmacie',
    subs: ['Contraception', 'Protection', 'Infections', 'Fertilité'],
  },
  {
    name: 'Parapharmacie',
    icon: '🌿',
    photo: 'parapharmacie',
    subs: ['Cosmétique', 'Bien-être', 'Solaire', 'Compléments'],
  },
];

export const catalogCategories = catalogTree.map((c) => c.name);

const categoryAliases: Record<string, string> = {
  Hygiène: 'Hygiène & Soins',
  Bébé: 'Maman & Bébé',
  Vitamines: 'Vitamines & Nutrition',
};

export function normalizeCategory(name?: string) {
  if (!name) return catalogCategories[0];
  return categoryAliases[name] || (catalogCategories.includes(name) ? name : catalogCategories[0]);
}

export function subcategoriesOf(category: string) {
  return catalogTree.find((c) => c.name === normalizeCategory(category))?.subs || [];
}

export function needsPrescription(status: RegulatoryStatus) {
  return status === 'rx' || status === 'controlled';
}

export function regulatoryLabel(status?: RegulatoryStatus | string) {
  return regulatoryStatuses.find((s) => s.id === status)?.label || (status ? 'Sans ordonnance' : 'Sans ordonnance');
}

export function statusFromLegacy(requiresPrescription?: boolean): RegulatoryStatus {
  return requiresPrescription ? 'rx' : 'otc';
}

export function resolveStatus(product: { regulatoryStatus?: RegulatoryStatus | string; requiresPrescription?: boolean }): RegulatoryStatus {
  if (product.regulatoryStatus === 'otc' || product.regulatoryStatus === 'rx' || product.regulatoryStatus === 'controlled') {
    return product.regulatoryStatus;
  }
  return statusFromLegacy(product.requiresPrescription);
}

export function regulatoryTone(status?: RegulatoryStatus | string): 'green' | 'red' | 'orange' | 'gray' {
  if (status === 'rx') return 'red';
  if (status === 'controlled') return 'orange';
  return 'gray';
}

const bySlug: Record<string, { category: string; subcategory: string; regulatoryStatus: RegulatoryStatus }> = {
  paracetamol: { category: 'Médicaments', subcategory: 'Antalgiques & fièvre', regulatoryStatus: 'otc' },
  ibuprofene: { category: 'Médicaments', subcategory: 'Antalgiques & fièvre', regulatoryStatus: 'otc' },
  amoxicilline: { category: 'Médicaments', subcategory: 'Anti-infectieux', regulatoryStatus: 'rx' },
  metformine: { category: 'Diabète', subcategory: 'Traitements', regulatoryStatus: 'rx' },
  amlodipine: { category: 'Médicaments', subcategory: 'Cardiologie', regulatoryStatus: 'rx' },
  ciprofloxacine: { category: 'Médicaments', subcategory: 'Anti-infectieux', regulatoryStatus: 'rx' },
  'vitamine-c': { category: 'Vitamines & Nutrition', subcategory: 'Vitamines', regulatoryStatus: 'otc' },
  'vitamine-d': { category: 'Vitamines & Nutrition', subcategory: 'Vitamines', regulatoryStatus: 'otc' },
  magnesium: { category: 'Vitamines & Nutrition', subcategory: 'Minéraux', regulatoryStatus: 'otc' },
  pansement: { category: 'Premiers soins', subcategory: 'Pansements & compresses', regulatoryStatus: 'otc' },
  compresses: { category: 'Premiers soins', subcategory: 'Pansements & compresses', regulatoryStatus: 'otc' },
  thermometre: { category: 'Matériel médical', subcategory: 'Autosurveillance', regulatoryStatus: 'otc' },
  'gel-hydro': { category: 'Hygiène & Soins', subcategory: 'Mains', regulatoryStatus: 'otc' },
  'savon-surgras': { category: 'Hygiène & Soins', subcategory: 'Hygiène corporelle', regulatoryStatus: 'otc' },
  'lait-1er-age': { category: 'Maman & Bébé', subcategory: 'Lait infantile', regulatoryStatus: 'otc' },
  'couches-t3': { category: 'Maman & Bébé', subcategory: 'Couches & hygiène', regulatoryStatus: 'otc' },
  'serum-physio': { category: 'Maman & Bébé', subcategory: 'Soins bébé', regulatoryStatus: 'otc' },
  'creme-solaire': { category: 'Dermatologie', subcategory: 'Protection solaire', regulatoryStatus: 'otc' },
  'baume-levres': { category: 'Parapharmacie', subcategory: 'Cosmétique', regulatoryStatus: 'otc' },
  'bandelettes-glycemie': { category: 'Diabète', subcategory: 'Glycémie', regulatoryStatus: 'otc' },
  preservatifs: { category: 'Santé sexuelle', subcategory: 'Protection', regulatoryStatus: 'otc' },
};

const slugAliases: Record<string, string> = {
  'vitamin-c': 'vitamine-c',
  bandages: 'pansement',
  amoxicillin: 'amoxicilline',
  'pc-para': 'paracetamol',
  'pc-ibup': 'ibuprofene',
  'pc-amox': 'amoxicilline',
  'pc-metf': 'metformine',
  'pc-amlo': 'amlodipine',
  'pc-cipro': 'ciprofloxacine',
  'pc-vitc': 'vitamine-c',
  'pc-vitd': 'vitamine-d',
  'pc-mag': 'magnesium',
  'pc-bandage': 'pansement',
  'pc-compresse': 'compresses',
  'pc-thermo': 'thermometre',
  'pc-gel': 'gel-hydro',
  'pc-savon': 'savon-surgras',
  'pc-lait': 'lait-1er-age',
  'pc-couches': 'couches-t3',
  'pc-serum': 'serum-physio',
  'pc-solaire': 'creme-solaire',
  'pc-baume': 'baume-levres',
  'pc-glyco': 'bandelettes-glycemie',
  'pc-preserv': 'preservatifs',
};

export function taxonomyFor(slug: string, fallbackCategory?: string, requiresPrescription?: boolean) {
  const key = slugAliases[slug] || slug;
  if (bySlug[key]) return bySlug[key];
  const category = normalizeCategory(fallbackCategory);
  return {
    category,
    subcategory: subcategoriesOf(category)[0] || '',
    regulatoryStatus: statusFromLegacy(requiresPrescription),
  };
}

export function categoryPhotoKey(name: string) {
  return catalogTree.find((c) => c.name === normalizeCategory(name))?.photo || 'medicaments';
}

export function categoryIcon(name: string) {
  return catalogTree.find((c) => c.name === normalizeCategory(name))?.icon || '💊';
}

export function sameCategory(productCategory: string, filter?: string) {
  if (!filter) return true;
  return normalizeCategory(productCategory) === normalizeCategory(filter);
}
