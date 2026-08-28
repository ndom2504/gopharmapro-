import { Fulfillment, Order, OrderStatus } from '../types';

export function isDelivery(order: Pick<Order, 'fulfillment'>) {
  return order.fulfillment === 'delivery';
}

export function orderStatusLabel(order: Pick<Order, 'status' | 'fulfillment'>): string {
  const delivery = isDelivery(order);
  const labels: Record<OrderStatus, string> = {
    paid: 'Payée',
    preparing: 'Préparation',
    ready: delivery ? 'Prête — ramassage' : 'Prête — retrait',
    picked_up: 'En livraison',
    delivered: delivery ? 'Livrée' : 'Retirée',
  };
  return labels[order.status];
}

export function orderStatusTone(status: OrderStatus): 'green' | 'red' | 'orange' | 'gray' {
  if (status === 'preparing' || status === 'ready') return 'orange';
  if (status === 'delivered') return 'gray';
  return 'green';
}

export function timelineFor(fulfillment: Fulfillment) {
  if (fulfillment === 'pickup') {
    return [
      { status: 'paid', label: 'Payée · retrait en pharmacie' },
      { status: 'preparing', label: 'Pharmacie en préparation' },
      { status: 'ready', label: 'Prête au retrait (votre code)' },
      { status: 'delivered', label: 'Retirée au comptoir' },
    ] as const;
  }
  return [
    { status: 'paid', label: 'Payée · livreur assigné' },
    { status: 'preparing', label: 'Pharmacie en préparation' },
    { status: 'ready', label: 'Prête au ramassage (code livreur)' },
    { status: 'picked_up', label: 'Ramassée · en route' },
    { status: 'delivered', label: 'Livrée au client (code client)' },
  ] as const;
}

const deliveryRank: Record<OrderStatus, number> = {
  paid: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
  delivered: 5,
};

const pickupRank: Record<OrderStatus, number> = {
  paid: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
  delivered: 4,
};

export function timelineReached(order: Pick<Order, 'status' | 'fulfillment'>) {
  const rank = isDelivery(order) ? deliveryRank : pickupRank;
  return rank[order.status] || 1;
}
