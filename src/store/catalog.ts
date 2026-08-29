import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { catalogCategories, needsPrescription, taxonomyFor } from '../lib/taxonomy';
import { useNotifications } from './notifications';

const KEY = 'pharmarket-pharmacy-catalog-v3';

export type CatalogStatus = 'published' | 'review';

export type CatalogItem = {
  id: string;
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
  price: number;
  stock: number;
  status: CatalogStatus;
  imageUris: string[];
  imageKey?: string;
};

type CatalogStore = {
  hydrated: boolean;
  items: CatalogItem[];
  hydrate: () => Promise<void>;
  addItem: (item: Omit<CatalogItem, 'id' | 'status'> & { status?: CatalogStatus }) => void;
  updateStock: (id: string, stock: number) => void;
  setStatus: (id: string, status: CatalogStatus) => void;
};

const seed: CatalogItem[] = [
  {
    id: 'pc-para',
    pharmacyId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    name: 'Paracétamol 500 mg',
    genericName: 'Paracétamol',
    dosage: '500 mg',
    form: 'Comprimés',
    category: 'Médicaments',
    subcategory: 'Antalgiques & fièvre',
    regulatoryStatus: 'otc',
    description: 'Douleur et fièvre. Respectez la notice.',
    requiresPrescription: false,
    price: 3500,
    stock: 20,
    status: 'published',
    imageUris: [],
    imageKey: 'paracetamol',
  },
  {
    id: 'pc-amox',
    pharmacyId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    name: 'Amoxicilline 500 mg',
    genericName: 'Amoxicilline',
    dosage: '500 mg',
    form: 'Gélules',
    category: 'Médicaments',
    subcategory: 'Anti-infectieux',
    regulatoryStatus: 'rx',
    description: 'Antibiotique soumis à ordonnance.',
    requiresPrescription: true,
    price: 6200,
    stock: 12,
    status: 'review',
    imageUris: [],
    imageKey: 'amoxicillin',
  },
  {
    id: 'pc-vitc',
    pharmacyId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    name: 'Vitamine C 1000 mg',
    genericName: 'Acide ascorbique',
    dosage: '1000 mg',
    form: 'Comprimés effervescents',
    category: 'Vitamines & Nutrition',
    subcategory: 'Vitamines',
    regulatoryStatus: 'otc',
    description: 'Complément alimentaire.',
    requiresPrescription: false,
    price: 4500,
    stock: 16,
    status: 'published',
    imageUris: [],
    imageKey: 'vitamin-c',
  },
  {
    id: 'pc-bandage',
    pharmacyId: 'ph-centre',
    pharmacyName: 'Pharmacie du Centre',
    name: 'Pansements stériles',
    genericName: 'Pansement',
    dosage: 'Boîte de 20',
    form: 'Boîte',
    category: 'Premiers soins',
    subcategory: 'Pansements & compresses',
    regulatoryStatus: 'otc',
    description: 'Pansements individuels stériles pour petites plaies.',
    requiresPrescription: false,
    price: 2200,
    stock: 30,
    status: 'published',
    imageUris: [],
    imageKey: 'bandages',
  },
];

let items: CatalogItem[] = [...seed];

async function persist() {
  await AsyncStorage.setItem(KEY, JSON.stringify({ items }));
}

export { catalogCategories };

export const usePharmacyCatalog = create<CatalogStore>((set) => ({
  hydrated: false,
  items: [...seed],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { items?: CatalogItem[] };
        if (parsed.items?.length) {
          const seedById = Object.fromEntries(seed.map((s) => [s.id, s]));
          items = parsed.items.map((i) => {
            const tax = taxonomyFor(i.imageKey || i.id, i.category, i.requiresPrescription);
            return {
              ...i,
              imageUris: i.imageUris || [],
              pharmacyName: i.pharmacyName || 'Pharmacie',
              imageKey: i.imageKey || seedById[i.id]?.imageKey,
              category: tax.category,
              subcategory: i.subcategory || tax.subcategory,
              regulatoryStatus: i.regulatoryStatus || tax.regulatoryStatus,
              requiresPrescription: needsPrescription(i.regulatoryStatus || tax.regulatoryStatus),
            };
          });
          for (const extra of seed) {
            if (!items.some((i) => i.id === extra.id)) items = [...items, extra];
          }
        }
      }
    } catch {
      items = [...seed];
    }
    set({ items, hydrated: true });
  },
  addItem: (input) => {
    const item: CatalogItem = {
      ...input,
      id: 'pc-' + Date.now(),
      pharmacyName: input.pharmacyName || 'Pharmacie',
      regulatoryStatus: input.regulatoryStatus || (input.requiresPrescription ? 'rx' : 'otc'),
      requiresPrescription: needsPrescription(input.regulatoryStatus || (input.requiresPrescription ? 'rx' : 'otc')),
      status: input.status || (needsPrescription(input.regulatoryStatus || (input.requiresPrescription ? 'rx' : 'otc')) ? 'review' : 'published'),
      imageUris: input.imageUris || [],
    };
    items = [item, ...items];
    set({ items });
    persist();
    if (item.status === 'published') {
      useNotifications.getState().push({
        audience: 'client',
        type: 'catalog_new',
        title: 'Nouveau médicament',
        body: item.name + ' est disponible chez ' + item.pharmacyName + '.',
      });
    }
  },
  updateStock: (id, stock) => {
    const prev = items.find((i) => i.id === id);
    items = items.map((i) => (i.id === id ? { ...i, stock } : i));
    set({ items });
    persist();
    if (prev && prev.stock !== stock && prev.status === 'published') {
      const direction = stock > prev.stock ? 'réapprovisionné' : 'mis à jour';
      useNotifications.getState().push({
        audience: 'client',
        type: 'catalog_stock',
        title: 'Stock ' + direction,
        body: prev.name + ' · ' + stock + ' unité(s) chez ' + (prev.pharmacyName || 'la pharmacie') + '.',
      });
    }
  },
  setStatus: (id, status) => {
    const prev = items.find((i) => i.id === id);
    items = items.map((i) => (i.id === id ? { ...i, status } : i));
    set({ items });
    persist();
    if (prev && status === 'published' && prev.status !== 'published') {
      useNotifications.getState().push({
        audience: 'client',
        type: 'catalog_new',
        title: 'Nouveau médicament',
        body: prev.name + ' est disponible chez ' + (prev.pharmacyName || 'la pharmacie') + '.',
      });
    }
  },
}));
