const deliverySteps = [
  'Commande passée',
  'Pharmacie confirmée',
  'Commande préparée',
  'Livreur en route',
  'Livrée',
];

const pickupSteps = ['Commande passée', 'Pharmacie confirmée', 'Prête au retrait', 'Retirée'];

const deliveryIndex: Record<string, number> = {
  paid: 0,
  Payée: 0,
  preparing: 1,
  ready: 2,
  accepted: 3,
  picked_up: 3,
  arrived: 3,
  delivered: 4,
  Livrée: 4,
};

const pickupIndex: Record<string, number> = {
  paid: 0,
  Payée: 0,
  preparing: 1,
  ready: 2,
  delivered: 3,
};

export function OrderTimeline({
  status,
  fulfillment,
}: {
  status: string;
  fulfillment: 'pickup' | 'delivery';
}) {
  const steps = fulfillment === 'delivery' ? deliverySteps : pickupSteps;
  const current = fulfillment === 'delivery' ? deliveryIndex[status] ?? 0 : pickupIndex[status] ?? 0;
  return (
    <ol className="mt-4 space-y-2 text-sm font-bold">
      {steps.map((label, i) => {
        const done = i < current;
        const on = i === current;
        const last = i === steps.length - 1;
        const icon = last && on ? '○' : done || on ? '✓' : '○';
        const text =
          i === 3 && fulfillment === 'delivery' && (on || done) && label === 'Livreur en route'
            ? '🚚 Livreur en route'
            : `${icon} ${label}`;
        return (
          <li key={label} className={done || on ? 'text-ink' : 'text-muted'}>
            {text}
            {!last ? <span className="mt-1 block pl-2 text-muted">↓</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
