import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const KEY = 'gpp-favorites-v1';

type FavStore = {
  pharmacies: string[];
  products: string[];
  hydrate: () => Promise<void>;
  togglePharmacy: (id: string) => void;
  toggleProduct: (id: string) => void;
  isPharmacy: (id: string) => boolean;
  isProduct: (id: string) => boolean;
};

export const useFavorites = create<FavStore>((set, get) => ({
  pharmacies: [],
  products: [],
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set(JSON.parse(raw));
    } catch {
      // keep empty
    }
  },
  togglePharmacy: (id) => {
    const pharmacies = get().pharmacies.includes(id) ? get().pharmacies.filter((x) => x !== id) : [...get().pharmacies, id];
    set({ pharmacies });
    AsyncStorage.setItem(KEY, JSON.stringify({ pharmacies, products: get().products }));
  },
  toggleProduct: (id) => {
    const products = get().products.includes(id) ? get().products.filter((x) => x !== id) : [...get().products, id];
    set({ products });
    AsyncStorage.setItem(KEY, JSON.stringify({ pharmacies: get().pharmacies, products }));
  },
  isPharmacy: (id) => get().pharmacies.includes(id),
  isProduct: (id) => get().products.includes(id),
}));
