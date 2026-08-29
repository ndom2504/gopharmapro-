import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, courierTabs, useTabScreenPad } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { useOrders } from '../src/store/orders';
import { formatFcfa } from '../src/lib/payouts';
import { isDelivery, orderStatusLabel, orderStatusTone } from '../src/lib/orderStatus';

export default function CourierRuns() {
  const session = useAuth((s) => s.session);
  const orders = useOrders((s) => s.orders);
  const [filter, setFilter] = useState<'all' | 'done' | 'cancel'>('all');
  const tabPad = useTabScreenPad();
  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;

  const mine = orders.filter((o) => isDelivery(o) && o.courierId === session.id);
  const list = mine.filter((o) => {
    if (filter === 'done') return o.status === 'delivered';
    if (filter === 'cancel') return false;
    return true;
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[s.page, { paddingBottom: tabPad }]}>
        <Text style={s.title}>Livraisons</Text>
        <View style={s.filters}>
          {[
            { id: 'all' as const, label: 'Toutes' },
            { id: 'done' as const, label: 'Terminées' },
            { id: 'cancel' as const, label: 'Annulées' },
          ].map((f) => (
            <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[s.chip, filter === f.id && s.chipOn]}>
              <Text style={filter === f.id ? s.chipOnText : s.chipText}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
        {list.length === 0 ? (
          <Card>
            <Text style={s.meta}>Aucune course dans ce filtre.</Text>
          </Card>
        ) : (
          list.map((o) => (
            <Card key={o.id} style={{ marginBottom: 12 }}>
              <View style={s.row}>
                <Text style={s.name}>#{o.id}</Text>
                <Badge text={orderStatusLabel(o)} tone={orderStatusTone(o.status)} />
              </View>
              <Text style={s.meta}>{new Date(o.createdAt).toLocaleDateString('fr-GA')}</Text>
              <Text style={s.gain}>{formatFcfa(o.split?.courierNet || o.fee)}</Text>
              <View style={{ marginTop: 12 }}>
                <Button title="Ouvrir" onPress={() => router.push({ pathname: '/courier-run/[id]', params: { id: o.id } })} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      <RoleTabBar items={courierTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontWeight: '700', color: colors.text },
  chipOnText: { fontWeight: '800', color: colors.onPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
  meta: { color: colors.muted, marginTop: 6 },
  gain: { color: colors.primary, fontWeight: '900', marginTop: 8 },
});
