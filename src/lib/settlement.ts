import { Order } from '../types';
import { DEMO_COURIER_ID, formatFcfa } from './payouts';
import { methodLabel, usePayouts } from '../store/payouts';
import { useNotifications } from '../store/notifications';
import { isDelivery } from './orderStatus';

export function settlePaidOrder(order: Order, pharmacyPhone?: string, courierPhone?: string) {
  const payouts = usePayouts.getState().creditOrder(order, pharmacyPhone, courierPhone);
  const notify = useNotifications.getState().push;
  const pharmacy = payouts.find((p) => p.beneficiary === 'pharmacy');
  const courier = payouts.find((p) => p.beneficiary === 'courier');
  const delivery = isDelivery(order);

  if (pharmacy) {
    notify({
      audience: 'pharmacy',
      targetId: pharmacy.accountId,
      type: 'payment',
      title: 'Paiement reçu',
      body:
        'Commande ' +
        order.id +
        ' · ' +
        formatFcfa(pharmacy.amount) +
        ' (produits, après commission) à verser sur ' +
        methodLabel(pharmacy.method) +
        ' (' +
        pharmacy.phone +
        ').',
    });
  }

  if (delivery && courier) {
    notify({
      audience: 'courier',
      targetId: courier.accountId || DEMO_COURIER_ID,
      type: 'payment',
      title: 'Course payée',
      body:
        'Livraison ' +
        order.id +
        ' · ' +
        formatFcfa(courier.amount) +
        ' · code ramassage ' +
        order.pickupCode +
        ' à présenter à ' +
        order.pharmacyName +
        '.',
    });
    notify({
      audience: 'courier',
      targetId: courier.accountId || DEMO_COURIER_ID,
      type: 'delivery',
      title: 'Code de ramassage',
      body: 'Commande ' + order.id + ' · code ' + order.pickupCode + ' · ' + order.pharmacyName + '.',
    });
  }

  if (delivery) {
    notify({
      audience: 'client',
      type: 'delivery',
      title: 'Code de livraison',
      body:
        'Commande ' +
        order.id +
        ' · donnez le code ' +
        order.deliveryCode +
        ' uniquement au livreur à la réception.',
    });
    notify({
      audience: 'pharmacy',
      targetId: order.pharmacyAccountId,
      type: 'delivery',
      title: 'Livraison à préparer',
      body: 'Commande ' + order.id + ' avec livreur. Il présentera un code au ramassage.',
    });
  } else {
    notify({
      audience: 'client',
      type: 'delivery',
      title: 'Code de retrait',
      body: 'Commande ' + order.id + ' · présentez le code ' + order.pickupCode + ' au comptoir. Pas de livreur.',
    });
    notify({
      audience: 'pharmacy',
      targetId: order.pharmacyAccountId,
      type: 'delivery',
      title: 'Retrait en pharmacie',
      body: 'Commande ' + order.id + ' sans livreur. Le client présentera son code au comptoir.',
    });
  }

  return payouts;
}
