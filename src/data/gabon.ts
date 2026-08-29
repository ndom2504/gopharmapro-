export type { PlaceTree } from './places';
export { gabonPlaces } from './places';
import { gabonPlaces } from './places';

export const provinces = Object.keys(gabonPlaces);

export function citiesOf(province: string) {
  return Object.keys(gabonPlaces[province] || {});
}

export function communesOf(province: string, city: string) {
  return Object.keys(gabonPlaces[province]?.[city] || {});
}

export function quartiersOf(province: string, city: string, commune: string) {
  return gabonPlaces[province]?.[city]?.[commune] || [];
}
