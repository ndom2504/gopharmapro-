import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Card, ScreenTitle, Button } from '../../src/components/UI';
import { useOrders } from '../../src/store/orders';
import { colors } from '../../src/theme';
import { getPaymentMethod } from '../../src/data/payments';

const statusLabel = { paid: 'Payée', preparing: 'Préparation', ready: 'Prête', delivered: 'Livrée' } as const;
const statusTone = { paid: 'green', preparing: 'orange', ready: 'green', delivered: 'gray' } as const;

export default function Orders() {
  const orders = useOrders((s) => s.orders);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Commandes" subtitle="Suivez vos achats, paiements et livraisons." />
      {orders.map((o) => {
        const pay = getPaymentMethod(o.payment.method);
        return (
          <Card key={o.id} style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <Text style={s.name}>Commande #{o.id}</Text>
              <Badge text={statusLabel[o.status]} tone={statusTone[o.status]} />
            </View>
            <Text style={s.meta}>
              {o.pharmacyName} · {o.total.toLocaleString('fr-FR')} FCFA
            </Text>
            <Text style={s.meta}>
              {pay.name} · {o.payment.phone}
            </Text>
            <View style={{ marginTop: 16 }}>
              <Button title="Suivre la commande" onPress={() => router.push({ pathname: '/order/[id]', params: { id: o.id } })} kind="secondary" />
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
  meta: { color: colors.muted, marginTop: 8 },
});
