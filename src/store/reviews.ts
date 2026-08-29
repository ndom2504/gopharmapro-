import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { PharmacyReview } from '../lib/pharmacyRating';

const KEY = 'gpp-reviews-v1';

type ReviewStore = {
  byPharmacy: Record<string, PharmacyReview>;
  hydrate: () => Promise<void>;
  setReview: (pharmacyId: string, review: PharmacyReview) => void;
  getReview: (pharmacyId: string) => PharmacyReview | undefined;
};

export const useReviews = create<ReviewStore>((set, get) => ({
  byPharmacy: {},
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { byPharmacy?: Record<string, PharmacyReview> };
        if (parsed.byPharmacy) set({ byPharmacy: parsed.byPharmacy });
      }
    } catch {
      // keep empty
    }
  },
  setReview: (pharmacyId, review) => {
    const byPharmacy = { ...get().byPharmacy, [pharmacyId]: review };
    set({ byPharmacy });
    AsyncStorage.setItem(KEY, JSON.stringify({ byPharmacy }));
  },
  getReview: (pharmacyId) => get().byPharmacy[pharmacyId],
}));
