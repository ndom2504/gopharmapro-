import { create } from 'zustand';

type CourierPrefs = {
  available: boolean;
  setAvailable: (value: boolean) => void;
};

export const useCourierPrefs = create<CourierPrefs>((set) => ({
  available: true,
  setAvailable: (available) => set({ available }),
}));
