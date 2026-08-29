const photos = {
  paracetamol: require('../../assets/products/paracetamol.png'),
  amoxicillin: require('../../assets/products/amoxicillin.png'),
  'vitamin-c': require('../../assets/products/vitamin-c.png'),
  bandages: require('../../assets/products/bandages.png'),
} as const;

const aliases: Record<string, keyof typeof photos> = {
  paracetamol: 'paracetamol',
  'pc-para': 'paracetamol',
  amoxicillin: 'amoxicillin',
  amoxicilline: 'amoxicillin',
  'pc-amox': 'amoxicillin',
  'vitamin-c': 'vitamin-c',
  'vitamine-c': 'vitamin-c',
  'pc-vitc': 'vitamin-c',
  bandages: 'bandages',
  pansement: 'bandages',
  'pc-bandage': 'bandages',
  compresses: 'bandages',
  'pc-compresse': 'bandages',
  ibuprofene: 'paracetamol',
  'pc-ibup': 'paracetamol',
  metformine: 'amoxicillin',
  'pc-metf': 'amoxicillin',
  amlodipine: 'amoxicillin',
  'pc-amlo': 'amoxicillin',
  ciprofloxacine: 'amoxicillin',
  'pc-cipro': 'amoxicillin',
  'vitamine-d': 'vitamin-c',
  'pc-vitd': 'vitamin-c',
  magnesium: 'vitamin-c',
  'pc-mag': 'vitamin-c',
  'lait-1er-age': 'vitamin-c',
  'pc-lait': 'vitamin-c',
  'creme-solaire': 'vitamin-c',
  'pc-solaire': 'vitamin-c',
  'baume-levres': 'vitamin-c',
  'pc-baume': 'vitamin-c',
  thermometre: 'bandages',
  'pc-thermo': 'bandages',
  'gel-hydro': 'bandages',
  'pc-gel': 'bandages',
  'savon-surgras': 'bandages',
  'pc-savon': 'bandages',
  'couches-t3': 'bandages',
  'pc-couches': 'bandages',
  'serum-physio': 'bandages',
  'pc-serum': 'bandages',
  'bandelettes-glycemie': 'bandages',
  'pc-glyco': 'bandages',
  preservatifs: 'bandages',
  'pc-preserv': 'bandages',
};

export type ProductPhotoKey = keyof typeof photos;

export function productPhoto(key?: string) {
  if (!key) return undefined;
  const mapped = aliases[key] || (key in photos ? (key as ProductPhotoKey) : undefined);
  return mapped ? photos[mapped] : undefined;
}
