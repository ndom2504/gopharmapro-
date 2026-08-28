export type PlaceTree = Record<string, Record<string, Record<string, string[]>>>;

/** Province → ville → commune → quartiers */
export const gabonPlaces: PlaceTree = {
  Estuaire: {
    Libreville: {
      'Libreville': ['Centre-ville', 'Glass', 'Louis', 'Batterie IV', 'Mont-Bouët', 'Nombakélé', 'Awendjé', 'Sotega'],
      'Akanda': ['Angondjé', 'Cap Estérias', 'La Sablière'],
    },
    Owendo: {
      Owendo: ['Oloumi', 'Lalala', 'Owendo-Gare', 'PK8'],
    },
    Ntoum: {
      Ntoum: ['Ntoum-Centre', 'Mbele'],
    },
  },
  'Ogooué-Maritime': {
    'Port-Gentil': {
      'Port-Gentil': ['Centre-ville', 'Grand Village', 'Ntchengue', 'Château'],
    },
    Gamba: { Gamba: ['Gamba-Centre'] },
  },
  'Haut-Ogooué': {
    Franceville: { Franceville: ['Potos', 'Mbaya', 'Ondili'] },
    Moanda: { Moanda: ['Moanda-Centre', 'Léyima'] },
  },
  'Woleu-Ntem': {
    Oyem: { Oyem: ['Oyem-Centre', 'Adjap'] },
    Bitam: { Bitam: ['Bitam-Centre'] },
  },
  'Moyen-Ogooué': {
    Lambaréné: { Lambaréné: ['Lambaréné-Centre', 'Isaac'] },
  },
  Ngounié: {
    Mouila: { Mouila: ['Mouila-Centre'] },
  },
  Nyanga: {
    Tchibanga: { Tchibanga: ['Tchibanga-Centre'] },
  },
  'Ogooué-Ivindo': {
    Makokou: { Makokou: ['Makokou-Centre'] },
  },
  'Ogooué-Lolo': {
    Koulamoutou: { Koulamoutou: ['Koulamoutou-Centre'] },
  },
};

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
