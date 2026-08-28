import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, ScreenTitle } from '../../src/components/UI';
import { OrderTimeline } from '../../src/components/OrderTimeline';
import { useOrders } from '../../src/store/orders';
import { colors } from '../../src/theme';
import { isDelivery, orderStatusLabel, orderStatusTone } from '../../src/lib/orderStatus';

export default function Orders() {
  const orders = useOrders((s) => s.orders);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Mes commandes" subtitle="Suivez paiement, préparation et livraison." />
      {orders.length === 0 ? (
        <Card>
          <Text style={s.meta}>Aucune commande pour le moment.</Text>
          <View style={{ marginTop: 14 }}>
            <Button title="Rechercher un médicament" onPress={() => router.replace('/(tabs)/search')} />
          </View>
        </Card>
      ) : null}
      {orders.map((o) => (
        <Card key={o.id} style={{ marginBottom: 14 }}>
          <View style={s.row}>
            <Text style={s.name}>Commande #{o.id}</Text>
            <Badge
              text={o.payment.status === 'paid' ? 'Paiement confirmé' : orderStatusLabel(o)}
              tone={orderStatusTone(o.status)}
            />
          </View>
          <Text style={s.meta}>
            {o.pharmacyName} · {o.total.toLocaleString('fr-FR')} FCFA
          </Text>
          <View style={{ marginTop: 14 }}>
            <OrderTimeline status={o.status} fulfillment={o.fulfillment} />
          </View>
          <View style={{ marginTop: 14, gap: 10 }}>
            <Button title="Suivre la commande" kind="secondary" onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })} />
            {isDelivery(o) && o.status !== 'delivered' ? (
              <Button title="Suivre ma livraison" onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })} />
            ) : null}
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
  meta: { color: colors.muted, marginTop: 8 },
});
