const files = {
  paracetamol: 'paracetamol.png',
  amoxicillin: 'amoxicillin.png',
  'vitamin-c': 'vitamin-c.png',
  bandages: 'bandages.png',
} as const;

const aliases: Record<string, keyof typeof files> = {
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

export function productImageSrc(key?: string) {
  if (!key) return undefined;
  const mapped = aliases[key] || (key in files ? (key as keyof typeof files) : undefined);
  return mapped ? `/products/${files[mapped]}` : undefined;
}
