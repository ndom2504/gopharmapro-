import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/UI';
import { CodeReveal, PinEntry } from '../../src/components/PinEntry';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { useOrders } from '../../src/store/orders';
import { orderStatusLabel, orderStatusTone } from '../../src/lib/orderStatus';
import { formatFcfa } from '../../src/lib/payouts';

const resultText = {
  ok: 'Livraison confirmée. Course terminée.',
  wrong: 'Code client incorrect. Demandez-le de nouveau.',
  not_ready: 'Validez d’abord le ramassage à la pharmacie.',
  locked: 'Trop d’essais. Contactez le support.',
  already: 'Cette course est déjà livrée.',
};

export default function CourierRun() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuth((s) => s.session);
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const confirmDelivery = useOrders((s) => s.confirmDelivery);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [fail, setFail] = useState('');

  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;
  if (!order || order.courierId !== session.id) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Course introuvable</Text>
      </View>
    );
  }

  const submit = () => {
    const result = confirmDelivery(order.id, code);
    if (result === 'ok') {
      setFail('');
      setMessage(resultText.ok);
      setCode('');
    } else {
      setMessage('');
      setFail(resultText[result]);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
      <Badge text={orderStatusLabel(order)} tone={orderStatusTone(order.status)} />
      <Text style={s.title}>Course #{order.id}</Text>
      <Text style={s.meta}>
        {order.pharmacyName} → {order.deliveryAddress}
      </Text>
      <Text style={s.meta}>{formatFcfa(order.split?.courierNet || order.fee)} de livraison</Text>

      {order.items.length ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Récupération</Text>
          <Text style={s.meta}>🏥 {order.pharmacyName}</Text>
          {order.items.map((i) => (
            <Text key={i.offer.id} style={s.meta}>
              {i.product.name} × {i.quantity}
            </Text>
          ))}
        </Card>
      ) : null}

      {order.status === 'paid' || order.status === 'preparing' ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>En attente pharmacie</Text>
          <Text style={s.meta}>Gardez le code. Le ramassage s’ouvre quand la pharmacie marque la commande prête.</Text>
        </Card>
      ) : null}

      {order.status !== 'delivered' ? (
        <View style={{ marginTop: 16 }}>
          <CodeReveal
            label="Code de ramassage"
            code={order.pickupCode}
            hint="Dictez ce code uniquement au comptoir de la pharmacie. Sans ce code, le colis ne sort pas."
          />
        </View>
      ) : null}

      {order.status === 'ready' ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>À la pharmacie</Text>
          <Text style={s.meta}>Dictez le code de ramassage au comptoir, puis confirmez.</Text>
        </Card>
      ) : null}

      {order.status === 'picked_up' ? (
        <Card style={{ marginTop: 16 }}>
          <Text style={s.label}>Chez le client</Text>
          <Text style={s.meta}>Le client a un autre code (sur son suivi). Saisissez-le pour clôturer la livraison.</Text>
          <PinEntry label="Code de livraison client" value={code} onChange={setCode} error={fail} />
          <View style={{ marginTop: 14 }}>
            <Button title="Confirmer la livraison" onPress={submit} disabled={code.length !== 6} />
          </View>
        </Card>
      ) : null}

      {order.status === 'delivered' ? (
        <Card style={{ marginTop: 16, backgroundColor: colors.mint, borderColor: '#BCE9D8' }}>
          <Text style={s.label}>Livrée</Text>
          <Text style={s.meta}>Course clôturée par le code client.</Text>
        </Card>
      ) : null}

      {message ? <Text style={s.ok}>{message}</Text> : null}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 10 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text },
  ok: { marginTop: 16, color: colors.primary, fontWeight: '800', lineHeight: 20 },
});
