const photos: Record<string, number> = {
  Médicaments: require('../../assets/categories/medicaments.png'),
  Hygiène: require('../../assets/categories/hygiene.png'),
  Bébé: require('../../assets/categories/bebe.png'),
  'Premiers soins': require('../../assets/categories/premiers-soins.png'),
  Vitamines: require('../../assets/categories/vitamines.png'),
  Parapharmacie: require('../../assets/categories/parapharmacie.png'),
};

export function categoryPhoto(name: string) {
  return photos[name];
}
