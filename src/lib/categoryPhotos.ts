import { categoryPhotoKey } from './taxonomy';

const files: Record<string, number> = {
  medicaments: require('../../assets/categories/medicaments.png'),
  hygiene: require('../../assets/categories/hygiene.png'),
  bebe: require('../../assets/categories/bebe.png'),
  'premiers-soins': require('../../assets/categories/premiers-soins.png'),
  vitamines: require('../../assets/categories/vitamines.png'),
  parapharmacie: require('../../assets/categories/parapharmacie.png'),
};

export function categoryPhoto(name: string) {
  return files[categoryPhotoKey(name)];
}
