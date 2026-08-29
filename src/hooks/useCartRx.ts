import { useAuth } from '../store/auth';
import { useCart } from '../store/cart';
import { usePrescriptions } from '../store/prescriptions';
import { cartRxGate, rxPayBlocked } from '../lib/rxGate';

export function useCartRx() {
  const items = useCart((s) => s.items);
  const session = useAuth((s) => s.session);
  const prescriptions = usePrescriptions((s) => s.items);
  const clientId = session?.role === 'client' ? session.id : undefined;
  const result = cartRxGate(items, prescriptions, clientId);
  return { ...result, blocked: rxPayBlocked(result.gate) };
}
