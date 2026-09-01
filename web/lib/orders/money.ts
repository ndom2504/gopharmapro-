export function money(value: number) {
  return Math.round(Number(value) * 100) / 100;
}

export function lineTotal(unitPrice: number, quantity: number) {
  return money(unitPrice * quantity);
}

export function configuredDeliveryFee() {
  const n = Number(process.env.ORDER_DELIVERY_FEE || 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return money(n);
}

export function formatMoney(value: number, currency = 'FCFA') {
  return `${money(value).toLocaleString('fr-FR')} ${currency}`;
}
