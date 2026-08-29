import { Coords, Pharmacy, Product } from '../types';
import type { CountryId } from '../data/places';

export const LIBREVILLE: Coords = { latitude: 0.3901, longitude: 9.4544 };
export const COTONOU: Coords = { latitude: 6.3654, longitude: 2.4183 };
export const DOUALA: Coords = { latitude: 4.0511, longitude: 9.7679 };
export const YAOUNDE: Coords = { latitude: 3.848, longitude: 11.5021 };

const GABON = { latMin: -4.0, latMax: 2.25, lngMin: 8.5, lngMax: 14.8 };
const BENIN = { latMin: 6.2, latMax: 12.5, lngMin: 0.7, lngMax: 3.9 };
const CAMEROON = { latMin: 2.3, latMax: 13.1, lngMin: 8.45, lngMax: 16.21 };

function inBox(coords: Coords, box: { latMin: number; latMax: number; lngMin: number; lngMax: number }) {
  return (
    coords.latitude >= box.latMin &&
    coords.latitude <= box.latMax &&
    coords.longitude >= box.lngMin &&
    coords.longitude <= box.lngMax
  );
}

export function isInGabon(coords: Coords) {
  return inBox(coords, GABON);
}

export function isInBenin(coords: Coords) {
  return inBox(coords, BENIN);
}

export function isInCameroon(coords: Coords) {
  return inBox(coords, CAMEROON);
}

export function isInServiceArea(coords: Coords) {
  return isInGabon(coords) || isInBenin(coords) || isInCameroon(coords);
}

export function countryFromCoords(coords: Coords): CountryId | null {
  if (isInBenin(coords)) return 'BJ';
  if (isInCameroon(coords)) return 'CM';
  if (isInGabon(coords)) return 'GA';
  return null;
}

export function hubForCountry(country?: CountryId | string): Coords {
  if (country === 'BJ') return COTONOU;
  if (country === 'CM') return DOUALA;
  return LIBREVILLE;
}

export function nearestHub(coords: Coords): Coords {
  const hubs = [LIBREVILLE, COTONOU, DOUALA];
  return hubs.reduce((best, hub) => (kmBetween(coords, hub) < kmBetween(coords, best) ? hub : best));
}

export function kmBetween(a: Coords, b: { latitude: number; longitude: number }) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export function formatKm(km: number) {
  if (km < 0.1) return '< 100 m';
  if (km < 1) return Math.round(km * 1000) + ' m';
  return km.toFixed(1).replace('.', ',') + ' km';
}

export function etaFromKm(km: number, delivery: boolean, fallback: string) {
  if (!delivery) return fallback;
  const min = Math.max(20, Math.round(18 + km * 7));
  return min + '–' + (min + 10) + ' min';
}

export function originForDistances(coords: Coords | null): Coords {
  if (coords && isInServiceArea(coords)) return coords;
  return coords ? nearestHub(coords) : LIBREVILLE;
}

export function locatePharmacy(pharmacy: Pharmacy, coords: Coords | null): Pharmacy {
  if (!coords) return pharmacy;
  const origin = originForDistances(coords);
  const distance = Math.round(kmBetween(origin, pharmacy) * 10) / 10;
  return { ...pharmacy, distance, eta: etaFromKm(distance, pharmacy.delivery, pharmacy.eta) };
}

export function locatePharmacies(list: Pharmacy[], coords: Coords | null) {
  return list.map((p) => locatePharmacy(p, coords)).sort((a, b) => a.distance - b.distance);
}

export function locateProducts(list: Product[], coords: Coords | null) {
  return list.map((product) => ({
    ...product,
    offers: product.offers.map((offer) => ({ ...offer, pharmacy: locatePharmacy(offer.pharmacy, coords) })),
  }));
}

export function formatAddress(parts: {
  street?: string | null;
  district?: string | null;
  city?: string | null;
  subregion?: string | null;
  country?: string | null;
}) {
  const bits = [parts.street, parts.district, parts.city || parts.subregion, parts.country].filter(
    (x): x is string => !!x && x.trim().length > 0,
  );
  return [...new Set(bits)].slice(0, 3).join(' · ') || 'Afrique centrale et de l’Ouest';
}
