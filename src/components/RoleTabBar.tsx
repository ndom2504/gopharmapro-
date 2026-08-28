import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export type RoleTab = { href: Href; icon: keyof typeof Ionicons.glyphMap; label: string; match: string };

export const courierTabs: RoleTab[] = [
  { href: '/courier-home', icon: 'home', label: 'Accueil', match: '/courier-home' },
  { href: '/courier-runs', icon: 'bicycle', label: 'Livraisons', match: '/courier-runs' },
  { href: '/courier-map', icon: 'map', label: 'Carte', match: '/courier-map' },
  { href: '/courier-earnings', icon: 'wallet', label: 'Revenus', match: '/courier-earnings' },
  { href: '/courier-profile', icon: 'person', label: 'Profil', match: '/courier-profile' },
];

export const pharmacyTabs: RoleTab[] = [
  { href: '/pharmacy-home', icon: 'home', label: 'Dashboard', match: '/pharmacy-home' },
  { href: '/pharmacy-orders', icon: 'cube', label: 'Commandes', match: '/pharmacy-orders' },
  { href: '/pharmacy-catalog', icon: 'medkit', label: 'Produits', match: '/pharmacy-catalog' },
  { href: '/pharmacy-prescriptions', icon: 'document-text', label: 'Ordonnances', match: '/pharmacy-prescriptions' },
  { href: '/pharmacy-payouts', icon: 'stats-chart', label: 'Ventes', match: '/pharmacy-payouts' },
  { href: '/pharmacy-profile', icon: 'person', label: 'Profil', match: '/pharmacy-profile' },
];

export function RoleTabBar({ items }: { items: RoleTab[] }) {
  const path = usePathname() || '';
  return (
    <View style={s.bar}>
      {items.map((item) => {
        const on = path === item.match || path.startsWith(item.match + '/');
        return (
          <Pressable key={item.match} onPress={() => router.replace(item.href)} style={s.item}>
            <Ionicons name={item.icon} size={22} color={on ? colors.primary : '#7A8781'} />
            <Text style={[s.label, on && s.on]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontSize: 10, fontWeight: '700', color: '#7A8781' },
  on: { color: colors.primary },
});
