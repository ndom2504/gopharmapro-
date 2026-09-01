import { countryOf, placesByCountry, type CountryId } from '@/lib/places';

export type SearchCity = {
  name: string;
  latitude: number | null;
  longitude: number | null;
};

const cityCoords: Partial<Record<CountryId, Record<string, { latitude: number; longitude: number }>>> = {
  GA: {
    Libreville: { latitude: 0.4162, longitude: 9.4673 },
    'Port-Gentil': { latitude: -0.7193, longitude: 8.7815 },
    Franceville: { latitude: -1.6333, longitude: 13.5833 },
    Oyem: { latitude: 1.5995, longitude: 11.5793 },
    Moanda: { latitude: -1.565, longitude: 13.198 },
    Mouila: { latitude: -1.8685, longitude: 11.0559 },
    Lambaréné: { latitude: -0.7001, longitude: 10.2406 },
  },
  BJ: {
    Cotonou: { latitude: 6.3703, longitude: 2.3912 },
    'Abomey-Calavi': { latitude: 6.4485, longitude: 2.3556 },
    'Porto-Novo': { latitude: 6.4969, longitude: 2.6289 },
    Parakou: { latitude: 9.3372, longitude: 2.6303 },
  },
  CM: {
    Yaoundé: { latitude: 3.848, longitude: 11.5021 },
    Douala: { latitude: 4.0511, longitude: 9.7679 },
    Bafoussam: { latitude: 5.4737, longitude: 10.4176 },
    Garoua: { latitude: 9.3017, longitude: 13.3921 },
  },
};

export function citiesForSearch(country?: string): SearchCity[] {
  const id = countryOf(country);
  const names = new Set<string>();
  for (const region of Object.values(placesByCountry[id] || {})) {
    for (const city of Object.keys(region)) names.add(city);
  }
  const coords = cityCoords[id] || {};
  for (const name of Object.keys(coords)) names.add(name);
  return [...names]
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map((name) => ({
      name,
      latitude: coords[name]?.latitude ?? null,
      longitude: coords[name]?.longitude ?? null,
    }));
}

export function cityOrigin(country: string | undefined, city: string | null | undefined) {
  if (!city) return null;
  const match = citiesForSearch(country).find((c) => c.name.toLowerCase() === city.trim().toLowerCase());
  if (!match || match.latitude == null || match.longitude == null) return null;
  return { latitude: match.latitude, longitude: match.longitude };
}
