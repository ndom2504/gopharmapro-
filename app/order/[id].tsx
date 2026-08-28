import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/UI';
import { CodeReveal } from '../../src/components/PinEntry';
import { OrderTimeline } from '../../src/components/OrderTimeline';
import { DeliveryTrack } from '../../src/components/DeliveryTrack';
import { useOrders } from '../../src/store/orders';
import { colors } from '../../src/theme';
import { getPaymentMethod } from '../../src/data/payments';
import { formatFcfa } from '../../src/lib/payouts';
import { isDelivery, orderStatusLabel, orderStatusTone } from '../../src/lib/orderStatus';

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
  const inTransit = delivery && order.status !== 'delivered';

  return (
    <ScrollView contentContainerStyle={s.page}>
      <Badge text={order.payment.status === 'paid' ? 'Paiement confirmé' : orderStatusLabel(order)} tone={orderStatusTone(order.status)} />
      <Text style={s.title}>Commande #{order.id}</Text>
      <Text style={s.meta}>
        {order.pharmacyName} · {delivery ? 'Livraison estimée ' + order.eta : 'Retrait en pharmacie'}
      </Text>

      <Card style={{ marginTop: 18 }}>
        <OrderTimeline status={order.status} fulfillment={order.fulfillment} />
      </Card>

      {inTransit ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Suivi livraison</Text>
          <DeliveryTrack
            pharmacyName={order.pharmacyName}
            courierName="Jean M."
            eta="15 min"
            distance="1,8 km"
            status={order.status === 'picked_up' ? 'En route vers vous' : 'Assigné à votre commande'}
          />
          <View style={{ marginTop: 14, gap: 10 }}>
            <Button title="Appeler le livreur" kind="secondary" onPress={() => Linking.openURL('tel:+24166000000')} />
            <Button title="Contacter le support" kind="secondary" onPress={() => Linking.openURL('mailto:info@misterdil.ca')} />
          </View>
        </Card>
      ) : null}

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
            hint="Présentez ce code au comptoir."
          />
        </View>
      ) : null}

      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>{pay.id === 'card' ? 'Paiement carte' : 'Paiement mobile'}</Text>
        <Text style={s.meta}>
          {pay.name} · {formatFcfa(order.total)}
        </Text>
        <Text style={s.meta}>Référence {order.payment.reference}</Text>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>{delivery ? 'Adresse de livraison' : 'Lieu de retrait'}</Text>
        <Text style={s.meta}>{order.deliveryAddress}</Text>
      </Card>
      <View style={{ marginTop: 16 }}>
        <Button title="Aide & support" kind="secondary" onPress={() => Alert.alert('Support', 'info@misterdil.ca')} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 27, fontWeight: '900', color: colors.text, marginTop: 12 },
  meta: { color: colors.muted, marginTop: 5, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text, fontSize: 15, marginBottom: 8 },
});
