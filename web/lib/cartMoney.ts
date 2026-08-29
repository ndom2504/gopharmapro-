export function fcfaAmount(value: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

export function lineTotal(price: number, quantity: number) {
  return fcfaAmount(price) * Math.max(0, Math.round(Number(quantity) || 0));
}

export function cartSubtotal(items: { offer: { price: number }; quantity: number }[]) {
  return items.reduce((sum, item) => sum + lineTotal(item.offer.price, item.quantity), 0);
}

export function cartCount(items: { quantity: number }[]) {
  return items.reduce((sum, item) => sum + Math.max(0, Math.round(Number(item.quantity) || 0)), 0);
}
