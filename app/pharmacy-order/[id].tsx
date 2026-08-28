import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/UI';
import { PinEntry } from '../../src/components/PinEntry';
import { colors } from '../../src/theme';
import { useAuth } from '../../src/store/auth';
import { useOrders } from '../../src/store/orders';
import { isDelivery, orderStatusLabel, orderStatusTone } from '../../src/lib/orderStatus';
import { formatFcfa } from '../../src/lib/payouts';

export default function PharmacyOrder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuth((s) => s.session);
  const order = useOrders((s) => s.orders.find((o) => o.id === id));
  const setStatus = useOrders((s) => s.setStatus);
  const confirmPickup = useOrders((s) => s.confirmPickup);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [fail, setFail] = useState('');

  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;
  if (!order || order.pharmacyAccountId !== session.id) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Commande introuvable</Text>
      </View>
    );
  }

  const delivery = isDelivery(order);
  const resultText = {
    ok: delivery ? 'Ramassage validé. Le livreur peut partir.' : 'Retrait validé. Colis remis au client.',
    wrong: delivery ? 'Code incorrect. Demandez au livreur de le relire.' : 'Code incorrect. Demandez au client de le relire.',
    not_ready: 'Marquez d’abord la commande comme prête.',
    locked: 'Trop d’essais. Contactez le support Go Pharma Pro.',
    already: delivery ? 'Ce colis a déjà été ramassé.' : 'Ce colis a déjà été retiré.',
  };

  const submit = () => {
    const result = confirmPickup(order.id, code);
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
      <Text style={s.title}>Commande #{order.id}</Text>
      <Text style={s.meta}>
        {formatFcfa(order.total)} · {delivery ? 'Livraison' : 'Retrait client'} · {order.deliveryAddress}
      </Text>

      <Card style={{ marginTop: 16 }}>
        <Text style={s.label}>{delivery ? 'Sécurité ramassage livreur' : 'Sécurité retrait client'}</Text>
        <Text style={s.meta}>
          {delivery
            ? 'Le client a demandé un livreur. Vous ne voyez pas le code. Le livreur le dicte, vous le saisissez.'
            : 'Pas de livreur. Le client dicte son code de retrait, vous le saisissez, puis vous remettez le colis.'}
        </Text>
      </Card>

      {order.status === 'paid' ? (
        <View style={{ marginTop: 16 }}>
          <Button title="Commencer la préparation" onPress={() => setStatus(order.id, 'preparing')} />
        </View>
      ) : null}
      {order.status === 'preparing' ? (
        <View style={{ marginTop: 16 }}>
          <Button
            title={delivery ? 'Marquer prête pour ramassage' : 'Marquer prête pour retrait'}
            onPress={() => setStatus(order.id, 'ready')}
          />
        </View>
      ) : null}

      {order.status === 'ready' ? (
        <Card style={{ marginTop: 16 }}>
          <PinEntry
            label={delivery ? 'Code livreur (6 chiffres)' : 'Code client (6 chiffres)'}
            value={code}
            onChange={setCode}
            error={fail}
          />
          <View style={{ marginTop: 14 }}>
            <Button title={delivery ? 'Valider le ramassage' : 'Valider le retrait'} onPress={submit} disabled={code.length !== 6} />
          </View>
        </Card>
      ) : null}

      {order.status === 'picked_up' || order.status === 'delivered' ? (
        <Card style={{ marginTop: 16, backgroundColor: colors.mint, borderColor: '#BCE9D8' }}>
          <Text style={s.label}>
            {order.status === 'delivered' ? (delivery ? 'Livrée au client' : 'Retirée par le client') : 'Remise au livreur'}
          </Text>
          <Text style={s.meta}>
            {order.status === 'delivered'
              ? delivery
                ? 'Le client a confirmé la réception avec son code.'
                : 'Le client a retiré le colis au comptoir.'
              : 'Colis sorti. En attente du code client à la livraison.'}
          </Text>
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
