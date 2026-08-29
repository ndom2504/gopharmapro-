export type PharmacyReview = { stars: number; comment?: string };

export function mergeRating(baseRating: number, baseCount: number, userStars?: number) {
  const count = Math.max(0, baseCount);
  if (!userStars) {
    return { rating: baseRating, count, yours: 0 };
  }
  const total = baseRating * count + userStars;
  const next = count + 1;
  return { rating: Math.round((total / next) * 10) / 10, count: next, yours: userStars };
}

export function formatRating(value: number) {
  return value.toFixed(1).replace('.', ',');
}
