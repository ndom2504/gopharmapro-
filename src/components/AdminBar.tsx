import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../theme';

export function AdminBar({ title }: { title: string }) {
  return (
    <View style={s.wrap}>
      <Text style={s.kicker}>Administration</Text>
      <Text style={s.title}>{title}</Text>
      <View style={s.nav}>
        {[
          { href: '/admin-home', label: 'Synthèse' },
          { href: '/admin-pharmacies', label: 'Officines' },
          { href: '/admin-couriers', label: 'Livreurs' },
          { href: '/admin-catalog', label: 'Produits' },
          { href: '/admin-orders', label: 'Commandes' },
          { href: '/admin-payouts', label: 'Virements' },
        ].map((l) => (
          <Pressable key={l.href} onPress={() => router.push(l.href as never)} style={s.chip}>
            <Text style={s.chipText}>{l.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginBottom: 8 },
  kicker: { color: colors.primary, fontWeight: '800', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: '#BCE9D8',
  },
  chipText: { fontWeight: '800', color: colors.primary, fontSize: 12 },
});
