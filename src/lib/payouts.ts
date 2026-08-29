import { PaymentMethodId, PaymentSplit, Pharmacy } from '../types';
import { suggestPaymentMethod } from '../data/payments';

/** Commission Go Pharma Pro sur le montant des produits (pas sur la livraison). */
export const PLATFORM_COMMISSION = 0.08;

export const DEMO_COURIER_ID = 'd-jean';

export function splitPayment(subtotal: number, deliveryFee: number): PaymentSplit {
  const platformFee = Math.round(subtotal * PLATFORM_COMMISSION);
  return {
    subtotal,
    deliveryFee,
    pharmacyNet: Math.max(0, subtotal - platformFee),
    courierNet: deliveryFee,
    platformFee,
  };
}

export function pharmacyAccountIdFor(pharmacy: Pick<Pharmacy, 'id' | 'name'>) {
  if (pharmacy.id === 'p1' || pharmacy.name.toLowerCase().includes('centre')) return 'ph-centre';
  if (pharmacy.id === 'p3' || pharmacy.name.toLowerCase().includes('palmier')) return 'ph-palmiers';
  return pharmacy.id;
}

export function formatFcfa(amount: number) {
  return amount.toLocaleString('fr-FR') + ' FCFA';
}

export function payoutMethodForPhone(phone: string): PaymentMethodId {
  return suggestPaymentMethod(phone) || 'airtel-money';
}

export function demoPayoutPhone(accountId: string, role: 'pharmacy' | 'courier') {
  if (role === 'pharmacy' && accountId === 'ph-centre') return '+241 77 11 22 33';
  if (role === 'courier' && accountId === DEMO_COURIER_ID) return '+241 66 00 00 00';
  return '';
}
