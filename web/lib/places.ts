export type CountryId = 'GA' | 'BJ' | 'CM';
export type PlaceTree = Record<string, Record<string, Record<string, string[]>>>;

export const countries: { id: CountryId; name: string; flag: string; callingCode: string; regionLabel: string }[] = [
  { id: 'GA', name: 'Gabon', flag: '🇬🇦', callingCode: '+241', regionLabel: 'Province' },
  { id: 'BJ', name: 'Bénin', flag: '🇧🇯', callingCode: '+229', regionLabel: 'Département' },
  { id: 'CM', name: 'Cameroun', flag: '🇨🇲', callingCode: '+237', regionLabel: 'Région' },
];

/** Province → ville → commune → quartiers */
export const gabonPlaces: PlaceTree = {
  Estuaire: {
    Libreville: {
      Libreville: ['Centre-ville', 'Glass', 'Louis', 'Batterie IV', 'Mont-Bouët', 'Nombakélé', 'Awendjé', 'Sotega'],
      Akanda: ['Angondjé', 'Cap Estérias', 'La Sablière'],
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

/** Département → ville → commune / arrondissement → quartiers */
export const beninPlaces: PlaceTree = {
  Littoral: {
    Cotonou: {
      '1er arrondissement': ['Ganhi', 'Zongo', 'Jonquet', 'Enagnon'],
      '2e arrondissement': ['Sikècodji', 'Avotrou', 'Yénawa'],
      '3e arrondissement': ['Aidjèdo', 'Tokplégbé', 'Gbedjromédé'],
      '4e arrondissement': ['Midombo', 'Missité'],
      '5e arrondissement': ['Akpakpa', 'Dandji', 'Sèbè'],
      '6e arrondissement': ['Cadjèhoun', 'Haie Vive', 'Fidjrossè', 'Aïbatin'],
      '7e arrondissement': ['Fifadji', 'Agla', 'Gbégamey'],
      '8e arrondissement': ['Vedoko', 'Houéyiho'],
      '9e arrondissement': ['Sainte-Rita', 'Mènontin'],
      '10e arrondissement': ['Suru-Léré', 'Missité-Nord'],
      '11e arrondissement': ['Kindonou', 'Gbedjromédé-Nord'],
      '12e arrondissement': ['Vossa', 'Ladji'],
      '13e arrondissement': ['Pk10', 'Pk14', 'Aïbatin-Est'],
    },
  },
  Atlantique: {
    'Abomey-Calavi': {
      Godomey: ['Togoudo', 'Cocotomey', 'Tankpè', 'Cococodji'],
      Calavi: ['Calavi-Centre', 'Togba', 'Kpanroun'],
      Zinvié: ['Zinvié-Centre'],
      Hêvié: ['Hêvié-Centre'],
    },
    Ouidah: {
      Ouidah: ['Ouidah-Centre', 'Pahou', 'Avlékété', 'Djègbadji'],
    },
    Allada: { Allada: ['Allada-Centre', 'Attogon'] },
    'Sèmè-Kpodji': {
      'Sèmè-Kpodji': ['Sèmè-Podji', 'Ekpè', 'Kraké', 'Djèrègbé'],
    },
  },
  Ouémé: {
    'Porto-Novo': {
      'Porto-Novo': ['Ouando', 'Agbokou', 'Djègan Daho', 'Houinmè', 'Zèbou', 'Avakpa'],
    },
    Adjarra: { Adjarra: ['Adjarra-Centre', 'Malanhoui'] },
    Avrankou: { Avrankou: ['Avrankou-Centre'] },
    'Akpro-Missérété': { 'Akpro-Missérété': ['Akpro-Missérété-Centre'] },
  },
  Plateau: {
    Pobè: { Pobè: ['Pobè-Centre', 'Igana'] },
    Kétou: { Kétou: ['Kétou-Centre', 'Adakplamè'] },
    Sakété: { Sakété: ['Sakété-Centre'] },
    Ifangni: { Ifangni: ['Ifangni-Centre', 'Banigbé'] },
  },
  Zou: {
    Abomey: { Abomey: ['Abomey-Centre', 'Djègbé', 'Houalou'] },
    Bohicon: { Bohicon: ['Bohicon-Centre', 'Avogbannan', 'Lissazounmè'] },
    Covè: { Covè: ['Covè-Centre'] },
    Zagnanado: { Zagnanado: ['Zagnanado-Centre'] },
  },
  Collines: {
    'Dassa-Zoumè': { 'Dassa-Zoumè': ['Dassa-Centre', 'Tré'] },
    Savalou: { Savalou: ['Savalou-Centre', 'Ouèssè'] },
    Savè: { Savè: ['Savè-Centre', 'Ofè'] },
    Glazoué: { Glazoué: ['Glazoué-Centre'] },
  },
  Mono: {
    Lokossa: { Lokossa: ['Lokossa-Centre', 'Agamé'] },
    Comè: { Comè: ['Comè-Centre', 'Oumako'] },
    'Grand-Popo': { 'Grand-Popo': ['Grand-Popo-Centre', 'Avlo'] },
    Houéyogbé: { Houéyogbé: ['Houéyogbé-Centre'] },
  },
  Couffo: {
    Aplahoué: { Aplahoué: ['Aplahoué-Centre', 'Azovè'] },
    Dogbo: { Dogbo: ['Dogbo-Centre', 'Tota'] },
    Djakotomey: { Djakotomey: ['Djakotomey-Centre'] },
  },
  Borgou: {
    Parakou: {
      Parakou: ['Albarika', 'Titirou', 'Guéma', 'Zongo', 'Kpébié', 'Banikanni'],
    },
    Nikki: { Nikki: ['Nikki-Centre', 'Serekali'] },
    "N'Dali": { "N'Dali": ["N'Dali-Centre"] },
    Tchaourou: { Tchaourou: ['Tchaourou-Centre', 'Bétérou'] },
    Bembèrèkè: { Bembèrèkè: ['Bembèrèkè-Centre'] },
  },
  Alibori: {
    Kandi: { Kandi: ['Kandi-Centre', 'Alibori', 'Kassakou'] },
    Banikoara: { Banikoara: ['Banikoara-Centre', 'Toura'] },
    Malanville: { Malanville: ['Malanville-Centre', 'Garou'] },
    Karimama: { Karimama: ['Karimama-Centre'] },
  },
  Atacora: {
    Natitingou: { Natitingou: ['Natitingou-Centre', 'Koussoucoingou', 'Perma'] },
    Tanguiéta: { Tanguiéta: ['Tanguiéta-Centre', 'Tanongou'] },
    Kouandé: { Kouandé: ['Kouandé-Centre'] },
    Toucountouna: { Toucountouna: ['Toucountouna-Centre'] },
  },
  Donga: {
    Djougou: { Djougou: ['Djougou-Centre', 'Barei', 'Kolokondé'] },
    Bassila: { Bassila: ['Bassila-Centre', 'Pénéssoulou'] },
    Copargo: { Copargo: ['Copargo-Centre'] },
  },
};

/** Région → ville → commune / arrondissement → quartiers */
export const cameroonPlaces: PlaceTree = {
  Littoral: {
    Douala: {
      'Douala I': ['Bonanjo', 'Bali', 'Bonapriso', 'Akwa-Nord'],
      'Douala II': ['New Bell', 'Nkololoun', 'Nkongmondo'],
      'Douala III': ['Bonamoussadi', 'Makepe', 'Kotto'],
      'Douala IV': ['Bonabéri', 'Bojongo', 'Mambanda'],
      'Douala V': ['Cité des Palmiers', 'Logpom', 'Kotto-Village'],
    },
    Edéa: { Edéa: ['Edéa-Centre', 'Dehane'] },
    Nkongsamba: { Nkongsamba: ['Nkongsamba-Centre', 'Eboulembou'] },
  },
  Centre: {
    Yaoundé: {
      'Yaoundé I': ['Nlongkak', 'Elig-Essono', 'Centre-ville'],
      'Yaoundé II': ['Tsinga', 'Messa', 'Nkomkana'],
      'Yaoundé III': ['Efoulan', 'Melen', 'Ngoa-Ekellé'],
      'Yaoundé IV': ['Kondengui', 'Ekounou', 'Mvan'],
      'Yaoundé V': ['Essos', 'Ngousso', 'Mfandena'],
      'Yaoundé VI': ['Biyem-Assi', 'Mendong', 'Nkolbikok'],
      'Yaoundé VII': ['Nkolbisson', 'Oyom-Abang'],
    },
    Mbalmayo: { Mbalmayo: ['Mbalmayo-Centre'] },
    Obala: { Obala: ['Obala-Centre'] },
    Soa: { Soa: ['Soa-Centre'] },
  },
  Ouest: {
    Bafoussam: { Bafoussam: ['Banengo', 'Tougang', 'Djeleng', 'Famla'] },
    Dschang: { Dschang: ['Dschang-Centre', 'Foréké'] },
    Mbouda: { Mbouda: ['Mbouda-Centre'] },
    Foumban: { Foumban: ['Foumban-Centre', 'Njintout'] },
  },
  'Nord-Ouest': {
    Bamenda: { Bamenda: ['Commercial Avenue', 'Nkwen', 'Mankon', 'Up Station'] },
    Kumbo: { Kumbo: ['Kumbo-Centre'] },
  },
  'Sud-Ouest': {
    Buea: { Buea: ['Molyko', 'Great Soppo', 'Buea Town'] },
    Limbe: { Limbe: ['Down Beach', 'Mile 4', 'Church Street'] },
    Kumba: { Kumba: ['Kumba-Centre', 'Fiango'] },
  },
  Sud: {
    Ebolowa: { Ebolowa: ['Ebolowa-Centre', 'Nkoetye'] },
    Kribi: { Kribi: ['Kribi-Centre', 'Lobé'] },
    Sangmélima: { Sangmélima: ['Sangmélima-Centre'] },
  },
  Est: {
    Bertoua: { Bertoua: ['Bertoua-Centre', 'Mokolo II'] },
    Batouri: { Batouri: ['Batouri-Centre'] },
    Yokadouma: { Yokadouma: ['Yokadouma-Centre'] },
  },
  Adamaoua: {
    Ngaoundéré: { Ngaoundéré: ['Ngaoundéré-Centre', 'Baladji', 'Sabongari'] },
    Meiganga: { Meiganga: ['Meiganga-Centre'] },
    Banyo: { Banyo: ['Banyo-Centre'] },
  },
  Nord: {
    Garoua: { Garoua: ['Garoua-Centre', 'Poumpoumré', 'Djamboutou'] },
    Guider: { Guider: ['Guider-Centre'] },
  },
  'Extrême-Nord': {
    Maroua: { Maroua: ['Maroua-Centre', 'Domayo', 'Pitoare'] },
    Kousseri: { Kousseri: ['Kousseri-Centre'] },
    Mokolo: { Mokolo: ['Mokolo-Centre'] },
  },
};

export const placesByCountry: Record<CountryId, PlaceTree> = {
  GA: gabonPlaces,
  BJ: beninPlaces,
  CM: cameroonPlaces,
};

export function countryOf(id?: string): CountryId {
  if (id === 'BJ' || id === 'CM' || id === 'GA') return id;
  return 'GA';
}

export function countryMeta(id?: string) {
  return countries.find((c) => c.id === countryOf(id)) || countries[0];
}

export function regionsOf(country?: string) {
  return Object.keys(placesByCountry[countryOf(country)]);
}

export function citiesOf(region: string, country?: string) {
  return Object.keys(placesByCountry[countryOf(country)][region] || {});
}

export function communesOf(region: string, city: string, country?: string) {
  return Object.keys(placesByCountry[countryOf(country)][region]?.[city] || {});
}

export function quartiersOf(region: string, city: string, commune: string, country?: string) {
  return placesByCountry[countryOf(country)][region]?.[city]?.[commune] || [];
}

export function firstPlace(country?: string) {
  const id = countryOf(country);
  const province = regionsOf(id)[0] || '';
  const city = citiesOf(province, id)[0] || '';
  const commune = communesOf(province, city, id)[0] || '';
  const area = quartiersOf(province, city, commune, id)[0] || '';
  return { country: id, province, city, commune, area };
}

export function communeLabel(country?: string, city?: string) {
  const id = countryOf(country);
  if (id === 'BJ' && city === 'Cotonou') return 'Arrondissement';
  if (id === 'CM' && (city === 'Douala' || city === 'Yaoundé')) return 'Arrondissement';
  return 'Commune';
}

export function countryLabel(id?: string) {
  return countryMeta(id).name;
}

export function serviceZoneShort() {
  return countries.map((c) => c.name).join(' · ');
}

export function serviceZoneAnd() {
  const names = countries.map((c) => c.name);
  if (names.length <= 1) return names[0] || '';
  if (names.length === 2) return `${names[0]} et ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}
