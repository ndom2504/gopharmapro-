import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Card } from '../../src/components/UI';
import { useOrders } from '../../src/store/orders';
import { colors } from '../../src/theme';
import { getPaymentMethod } from '../../src/data/payments';

const timeline = [
  { key: 'paid', label: 'Commande payée' },
  { key: 'preparing', label: 'Acceptée par la pharmacie' },
  { key: 'preparing', label: 'En préparation' },
  { key: 'ready', label: 'Prête pour la livraison' },
  { key: 'delivered', label: 'Livrée' },
] as const;

const reached = { paid: 1, preparing: 3, ready: 4, delivered: 5 };

export default function Order() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.get(id || ''));
  if (!order) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Commande introuvable</Text>
        <Text style={s.meta}>Cette commande n’est plus disponible sur cet appareil.</Text>
      </View>
    );
  }
  const pay = getPaymentMethod(order.payment.method);
  const doneUntil = reached[order.status];
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Badge text={order.status === 'paid' ? 'Payée' : order.status === 'preparing' ? 'En préparation' : order.status === 'ready' ? 'Prête' : 'Livrée'} tone={order.status === 'preparing' ? 'orange' : 'green'} />
      <Text style={s.title}>Commande #{order.id}</Text>
      <Text style={s.meta}>
        {order.pharmacyName} · Livraison estimée {order.eta}
      </Text>
      <Card style={{ marginTop: 22 }}>
        {timeline.map((step, i) => {
          const done = i < doneUntil;
          return (
            <View key={step.label} style={s.step}>
              <View style={[s.dot, done && s.done]}>{done ? <Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={[s.label, !done && { color: colors.muted }]}>{step.label}</Text>
                {i === 2 && done ? <Text style={s.meta}>Mise à jour il y a quelques minutes</Text> : null}
              </View>
            </View>
          );
        })}
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Paiement mobile</Text>
        <Text style={s.meta}>
          {pay.name} ({pay.operator})
        </Text>
        <Text style={s.meta}>{order.payment.phone}</Text>
        <Text style={s.meta}>
          Référence {order.payment.reference} · {order.total.toLocaleString('fr-FR')} FCFA
        </Text>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Adresse de livraison</Text>
        <Text style={s.meta}>{order.deliveryAddress}</Text>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 27, fontWeight: '900', color: colors.text, marginTop: 12 },
  meta: { color: colors.muted, marginTop: 5 },
  step: { flexDirection: 'row', gap: 13, minHeight: 65 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontWeight: '800', color: colors.text, fontSize: 15 },
});
