import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Card } from '../../src/components/UI';
import { CodeReveal } from '../../src/components/PinEntry';
import { useOrders } from '../../src/store/orders';
import { colors } from '../../src/theme';
import { getPaymentMethod } from '../../src/data/payments';
import { formatFcfa } from '../../src/lib/payouts';
import { isDelivery, orderStatusLabel, orderStatusTone, timelineFor, timelineReached } from '../../src/lib/orderStatus';

export default function Order() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  if (!order) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Commande introuvable</Text>
        <Text style={s.meta}>Cette commande n’est plus disponible sur cet appareil.</Text>
      </View>
    );
  }
  const pay = getPaymentMethod(order.payment.method);
  const delivery = isDelivery(order);
  const doneUntil = timelineReached(order);
  const steps = timelineFor(order.fulfillment);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <Badge text={orderStatusLabel(order)} tone={orderStatusTone(order.status)} />
      <Text style={s.title}>Commande #{order.id}</Text>
      <Text style={s.meta}>
        {order.pharmacyName} · {delivery ? 'Livraison estimée ' + order.eta : 'Retrait en pharmacie'}
      </Text>

      {order.status !== 'delivered' && delivery && order.deliveryCode ? (
        <View style={{ marginTop: 18 }}>
          <CodeReveal
            label="Votre code de livraison"
            code={order.deliveryCode}
            hint="Donnez ce code uniquement au livreur à la réception."
          />
        </View>
      ) : null}
      {order.status !== 'delivered' && !delivery ? (
        <View style={{ marginTop: 18 }}>
          <CodeReveal
            label="Votre code de retrait"
            code={order.pickupCode}
            hint="Présentez ce code au comptoir. Pas de livreur pour cette commande."
          />
        </View>
      ) : null}

      <Card style={{ marginTop: 18 }}>
        {steps.map((step, i) => {
          const done = i < doneUntil;
          return (
            <View key={step.label} style={s.step}>
              <View style={[s.dot, done && s.done]}>{done ? <Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={[s.label, !done && { color: colors.muted }]}>{step.label}</Text>
              </View>
            </View>
          );
        })}
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>{pay.id === 'card' ? 'Paiement carte' : 'Paiement mobile'}</Text>
        <Text style={s.meta}>
          {pay.name} ({pay.operator})
        </Text>
        <Text style={s.meta}>{order.payment.phone}</Text>
        <Text style={s.meta}>
          Référence {order.payment.reference} · {formatFcfa(order.total)}
        </Text>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>Répartition</Text>
        <Text style={s.meta}>Produits : {formatFcfa(order.split?.subtotal || order.subtotal)}</Text>
        <Text style={s.meta}>Pharmacie (après commission) : {formatFcfa(order.split?.pharmacyNet || 0)}</Text>
        {delivery ? <Text style={s.meta}>Livreur : {formatFcfa(order.split?.courierNet || order.fee)}</Text> : <Text style={s.meta}>Livreur : non demandé</Text>}
        <Text style={s.meta}>Go Pharma Pro : {formatFcfa(order.split?.platformFee || 0)}</Text>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>{delivery ? 'Adresse de livraison' : 'Lieu de retrait'}</Text>
        <Text style={s.meta}>{order.deliveryAddress}</Text>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 27, fontWeight: '900', color: colors.text, marginTop: 12 },
  meta: { color: colors.muted, marginTop: 5 },
  step: { flexDirection: 'row', gap: 13, minHeight: 58 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { fontWeight: '800', color: colors.text, fontSize: 15 },
});
