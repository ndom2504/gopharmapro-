import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, pharmacyTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { useOrders } from '../src/store/orders';
import { isDelivery, orderStatusLabel, orderStatusTone } from '../src/lib/orderStatus';
import { formatFcfa } from '../src/lib/payouts';

export default function PharmacyOrders() {
  const session = useAuth((s) => s.session);
  const orders = useOrders((s) => s.orders);
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;

  const mine = orders.filter((o) => o.pharmacyAccountId === session.id);
  const pending = mine.filter((o) => o.status !== 'delivered');

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={s.page}>
      <Text style={s.title}>Commandes</Text>
      <Text style={s.meta}>
        Le client choisit retrait ou livraison. S’il prend un livreur, celui-ci dicte un code. S’il vient lui-même, il dicte son code de retrait.
      </Text>
      {mine.length === 0 ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.empty}>Aucune commande pour le moment.</Text>
        </Card>
      ) : (
        (pending.length ? pending : mine).map((o) => (
          <Card key={o.id} style={{ marginTop: 12 }}>
            <View style={s.row}>
              <Text style={s.name}>#{o.id}</Text>
              <Badge text={orderStatusLabel(o)} tone={orderStatusTone(o.status)} />
            </View>
            <Text style={s.meta}>{formatFcfa(o.total)} · {isDelivery(o) ? 'Livraison' : 'Retrait'} · {o.deliveryAddress}</Text>
            <Text style={s.meta}>
              {isDelivery(o)
                ? 'Ne remettez le colis au livreur qu’après son code.'
                : 'Ne remettez le colis au client qu’après son code de retrait.'}
            </Text>
            <View style={{ marginTop: 14 }}>
              <Button title="Ouvrir" onPress={() => router.push({ pathname: '/pharmacy-order/[id]', params: { id: o.id } })} />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { flex: 1, fontWeight: '800', color: colors.text, fontSize: 16 },
  empty: { color: colors.muted, fontWeight: '700' },
});
