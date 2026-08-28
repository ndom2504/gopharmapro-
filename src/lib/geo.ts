import { Coords, Pharmacy, Product } from '../types';

export const LIBREVILLE: Coords = { latitude: 0.3901, longitude: 9.4544 };

const GABON = { latMin: -4.0, latMax: 2.4, lngMin: 8.5, lngMax: 14.8 };

export function isInGabon(coords: Coords) {
  return (
    coords.latitude >= GABON.latMin &&
    coords.latitude <= GABON.latMax &&
    coords.longitude >= GABON.lngMin &&
    coords.longitude <= GABON.lngMax
  );
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
  if (coords && isInGabon(coords)) return coords;
  return LIBREVILLE;
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
  return [...new Set(bits)].slice(0, 3).join(' · ') || 'Gabon';
}
