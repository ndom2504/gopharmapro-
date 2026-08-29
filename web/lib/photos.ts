const files = {
  paracetamol: 'paracetamol.png',
  amoxicillin: 'amoxicillin.png',
  'vitamin-c': 'vitamin-c.png',
  bandages: 'bandages.png',
} as const;

const aliases: Record<string, keyof typeof files> = {
  paracetamol: 'paracetamol',
  'pc-para': 'paracetamol',
  ibuprofene: 'paracetamol',
  'pc-ibup': 'paracetamol',
  amoxicillin: 'amoxicillin',
  amoxicilline: 'amoxicillin',
  'pc-amox': 'amoxicillin',
  metformine: 'amoxicillin',
  'pc-metf': 'amoxicillin',
  amlodipine: 'amoxicillin',
  'pc-amlo': 'amoxicillin',
  ciprofloxacine: 'amoxicillin',
  'pc-cipro': 'amoxicillin',
  'vitamin-c': 'vitamin-c',
  'vitamine-c': 'vitamin-c',
  'pc-vitc': 'vitamin-c',
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
  bandages: 'bandages',
  pansement: 'bandages',
  'pc-bandage': 'bandages',
  compresses: 'bandages',
  'pc-compresse': 'bandages',
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
};

export function productImageSrc(key?: string) {
  if (!key) return undefined;
  const mapped = aliases[key] || (key in files ? (key as keyof typeof files) : undefined);
  return mapped ? `/products/${files[mapped]}?v=2` : undefined;
}
