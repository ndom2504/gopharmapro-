import { create } from 'zustand';
import { Linking } from 'react-native';
import * as Location from 'expo-location';
import { Coords } from '../types';
import { formatAddress, isInGabon, LIBREVILLE } from '../lib/geo';

export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

type LocationStore = {
  status: LocationStatus;
  coords: Coords | null;
  address: string | null;
  outsideGabon: boolean;
  refresh: () => Promise<void>;
};

let inflight: Promise<void> | null = null;

async function readAddress(coords: Coords) {
  try {
    const [place] = await Location.reverseGeocodeAsync(coords);
    if (!place) return isInGabon(coords) ? 'Libreville, Gabon' : 'Position actuelle';
    return formatAddress(place);
  } catch {
    return isInGabon(coords) ? 'Libreville, Gabon' : 'Position actuelle';
  }
}

export const useLocation = create<LocationStore>((set) => ({
  status: 'idle',
  coords: null,
  address: null,
  outsideGabon: false,
  refresh: async () => {
    if (inflight) return inflight;
    set({ status: 'loading' });
    inflight = (async () => {
      try {
        const current = await Location.getForegroundPermissionsAsync();
        let status = current.status;
        if (status === 'denied' && current.canAskAgain === false) {
          await Linking.openSettings();
        }
        if (status !== 'granted') {
          const asked = await Location.requestForegroundPermissionsAsync();
          status = asked.status;
        }
        if (status !== 'granted') {
          set({ status: 'denied', coords: null, address: null, outsideGabon: false });
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        const outsideGabon = !isInGabon(coords);
        const address = outsideGabon ? 'Hors Gabon · aperçu Libreville' : await readAddress(coords);
        set({
          status: 'granted',
          coords: outsideGabon ? LIBREVILLE : coords,
          address,
          outsideGabon,
        });
      } catch {
        set({ status: 'error', coords: null, address: null, outsideGabon: false });
      }
    })().finally(() => {
      inflight = null;
    });
    return inflight;
  },
}));
