import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Button, Card } from '../src/components/UI';
import { useCart } from '../src/store/cart';
import { settlePaidOrder } from '../src/lib/settlement';
import { buildPayment, orderFromCart, useOrders } from '../src/store/orders';
import { colors } from '../src/theme';
import { Fulfillment } from '../src/types';
import { useLocation } from '../src/store/location';
import { getPaymentMethod } from '../src/data/payments';
import { createGeniusPayCheckout } from '../src/lib/geniusPay';

export default function PayGenius() {
  const params = useLocalSearchParams<{ phone?: string; total?: string; fulfillment?: string }>();
  const method = getPaymentMethod('geniuspay');
  const phone = params.phone || '';
  const fulfillment: Fulfillment = params.fulfillment === 'delivery' ? 'delivery' : 'pickup';
  const total = Number(params.total || 0);
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.add);
  const done = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const finish = (reference?: string) => {
    if (done.current || !items.length) return;
    done.current = true;
    const subtotal = items.reduce((a, i) => a + i.offer.price * i.quantity, 0);
    const address = useLocation.getState().address || 'Adresse à confirmer · Bénin';
    const payment = buildPayment(method.name, 'geniuspay', phone || 'GeniusPay');
    if (reference) payment.reference = reference;
    const order = addOrder(orderFromCart(items, payment, subtotal, address, fulfillment));
    settlePaidOrder(order);
    clear();
    router.replace({ pathname: '/order/[id]', params: { id: order.id } });
  };

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      const returnUrl = Linking.createURL('pay-genius');
      const session = await createGeniusPayCheckout({
        amount: total,
        phone,
        returnUrl,
        label: 'Commande Go Pharma Pro',
      });
      if (session.demo) {
        setTimeout(() => finish('GP-DEMO'), 900);
        return;
      }
      const browser = await WebBrowser.openAuthSessionAsync(session.url, returnUrl);
      if (browser.type === 'cancel' || browser.type === 'dismiss') return;
      if (browser.type === 'success') {
        finish(session.reference);
        return;
      }
      setError('Paiement GeniusPay interrompu.');
    } catch {
      setError('Impossible d’ouvrir GeniusPay. Réessayez.');
    } finally {
      setBusy(false);
    }
  };

  if (!items.length && !done.current) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Paiement interrompu</Text>
        <Text style={s.meta}>Le panier est vide. Revenez au catalogue pour passer commande.</Text>
        <View style={{ marginTop: 20 }}>
          <Button title="Retour à l’accueil" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.page}>
      <View style={[s.badge, { backgroundColor: method.background }]}>
        <Text style={[s.badgeText, { color: method.color }]}>{method.name}</Text>
      </View>
      <Text style={s.title}>Payer au Bénin</Text>
      <Text style={s.meta}>
        MTN MoMo et Moov Money via GeniusPay. Le montant est encaissé par Go Pharma Pro, puis réparti vers la pharmacie.
      </Text>
      <Card style={{ marginTop: 20 }}>
        <Text style={s.amount}>{total.toLocaleString('fr-FR')} FCFA</Text>
        <Text style={s.meta}>Marchand Go Pharma Pro · Bénin · XOF</Text>
        {phone ? <Text style={s.meta}>Compte : {phone}</Text> : null}
      </Card>
      {error ? <Text style={s.error}>{error}</Text> : <Text style={s.hint}>{method.hint}</Text>}
      <View style={{ marginTop: 18 }}>
        {busy ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Button title={'Payer ' + total.toLocaleString('fr-FR') + ' FCFA'} onPress={pay} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 14 },
  badgeText: { fontWeight: '800' },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  amount: { fontSize: 28, fontWeight: '900', color: colors.text },
  error: { color: colors.danger, fontWeight: '700', marginTop: 12, fontSize: 13, lineHeight: 18 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 12, lineHeight: 18 },
});
