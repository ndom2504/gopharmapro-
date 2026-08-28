import { PaymentMethodId } from '../types';

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  short: string;
  operator: string;
  ussd: string;
  prefixes: string[];
  color: string;
  background: string;
  hint: string;
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'mobicash',
    name: 'MobiCash',
    short: 'MC',
    operator: 'Gabon Telecom',
    ussd: '*555#',
    prefixes: ['062', '065', '02', '05'],
    color: '#E87722',
    background: '#FFF4E8',
    hint: 'Validez le paiement MobiCash avec votre code PIN.',
  },
  {
    id: 'airtel-money',
    name: 'Airtel Money',
    short: 'AM',
    operator: 'Airtel Gabon',
    ussd: '*150#',
    prefixes: ['074', '077', '04', '07'],
    color: '#E4002B',
    background: '#FDE8EC',
    hint: 'Validez le paiement Airtel Money avec votre code PIN.',
  },
  {
    id: 'moov-money',
    name: 'Moov Money',
    short: 'MM',
    operator: 'Moov Africa',
    ussd: '*555#',
    prefixes: ['066', '06'],
    color: '#0077C8',
    background: '#E8F4FC',
    hint: 'Validez le paiement Moov Money avec votre code PIN.',
  },
];

export function getPaymentMethod(id: PaymentMethodId) {
  return paymentMethods.find((m) => m.id === id)!;
}

/** Normalise un numéro gabonais vers +241 XX XX XX XX */
export function parseGabonPhone(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('241')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (!/^[2-7]\d{6,7}$/.test(digits)) return null;
  const local = '0' + digits;
  const groups = digits.match(/.{1,2}/g)?.join(' ') || digits;
  return {
    local,
    e164: '+241' + digits,
    display: '+241 ' + groups,
  };
}

export function suggestPaymentMethod(input: string): PaymentMethodId | null {
  const digits = input.replace(/\D/g, '');
  const national = digits.startsWith('241') ? '0' + digits.slice(3) : digits.startsWith('0') ? digits : '0' + digits;
  const match = paymentMethods.find((m) => m.prefixes.some((p) => national.startsWith(p)));
  return match?.id ?? null;
}

export function formatPhoneInput(input: string) {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('241')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.slice(0, 8);
  return digits.replace(/(\d{2})(\d{0,2})(\d{0,2})(\d{0,2})/, (_, a, b, c, d) =>
    [a, b, c, d].filter(Boolean).join(' '),
  );
}
