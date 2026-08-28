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
};

export type ProductPhotoKey = keyof typeof photos;

export function productPhoto(key?: string) {
  if (!key) return undefined;
  const mapped = aliases[key] || (key in photos ? (key as ProductPhotoKey) : undefined);
  return mapped ? photos[mapped] : undefined;
}
