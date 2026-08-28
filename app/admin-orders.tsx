import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { useOrders } from '../src/store/orders';
import { getPaymentMethod } from '../src/data/payments';
import { formatFcfa } from '../src/lib/payouts';
import { orderStatusLabel, orderStatusTone } from '../src/lib/orderStatus';

export default function AdminOrders() {
  const session = useAuth((s) => s.session);
  const orders = useOrders((s) => s.orders);
  if (!session || session.role !== 'admin') return <Redirect href={'/auth' as Href} />;
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Commandes" />
      <Text style={s.meta}>Suivi des paiements encaissés par Go Pharma Pro.</Text>
      {orders.length === 0 ? <Text style={s.meta}>Aucune commande pour le moment.</Text> : null}
      {orders.map((o) => {
        const pay = getPaymentMethod(o.payment.method);
        return (
          <Card key={o.id} style={{ marginTop: 12 }}>
            <View style={s.row}>
              <Text style={s.name}>#{o.id}</Text>
              <Badge text={orderStatusLabel(o)} tone={orderStatusTone(o.status)} />
            </View>
            <Text style={s.meta}>
              {o.pharmacyName} · {formatFcfa(o.total)}
            </Text>
            <Text style={s.meta}>
              {pay.name} · {o.payment.reference}
            </Text>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
});
