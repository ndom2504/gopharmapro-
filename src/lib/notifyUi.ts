import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export type NotificationType = 'payment' | 'payout' | 'catalog_new' | 'catalog_stock' | 'delivery' | 'prescription';

export const notifyGlyph = require('../../assets/notification-badge.png');
export const notifyStatusIcon = require('../../assets/notification-icon.png');

export const notifyMeta: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; channel: string; sound: 'payment' | 'payout' | 'catalog'; label: string }
> = {
  payment: { icon: 'cash', color: colors.primary, channel: 'payments', sound: 'payment', label: 'Paiement' },
  payout: { icon: 'wallet', color: colors.primaryDark, channel: 'payments', sound: 'payout', label: 'Virement' },
  catalog_new: { icon: 'medkit', color: colors.blue, channel: 'catalog', sound: 'catalog', label: 'Nouveau produit' },
  catalog_stock: { icon: 'layers', color: '#E67700', channel: 'catalog', sound: 'catalog', label: 'Stock' },
  delivery: { icon: 'bicycle', color: colors.primary, channel: 'payments', sound: 'payout', label: 'Livraison' },
  prescription: { icon: 'document-text', color: colors.blue, channel: 'catalog', sound: 'catalog', label: 'Ordonnance' },
};
