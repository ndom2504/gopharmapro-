import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Button, Card } from '../src/components/UI';
import { Field } from '../src/components/Field';
import { useCart } from '../src/store/cart';
import { settlePaidOrder } from '../src/lib/settlement';
import { buildPayment, orderFromCart, useOrders } from '../src/store/orders';
import { colors } from '../src/theme';
import { Fulfillment } from '../src/types';
import { useLocation } from '../src/store/location';
import {
  cardBrandLabel,
  createStripeCheckout,
  formatCardExpiry,
  formatCardNumber,
  isStripeTestCard,
} from '../src/lib/stripePay';

export default function PayCard() {
  const params = useLocalSearchParams<{ total?: string; fulfillment?: string }>();
  const fulfillment: Fulfillment = params.fulfillment === 'delivery' ? 'delivery' : 'pickup';
  const total = Number(params.total || 0);
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.add);
  const done = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const finish = (phoneLabel: string) => {
    if (done.current || !items.length) return;
    done.current = true;
    const subtotal = items.reduce((a, i) => a + i.offer.price * i.quantity, 0);
    const address = useLocation.getState().address || 'Adresse à confirmer · Gabon';
    const order = addOrder(
      orderFromCart(items, buildPayment('Carte bancaire', 'card', phoneLabel), subtotal, address, fulfillment),
    );
    settlePaidOrder(order);
    clear();
    router.replace({ pathname: '/order/[id]', params: { id: order.id } });
  };

  const payHosted = async () => {
    setError('');
    setBusy(true);
    try {
      const returnUrl = Linking.createURL('pay-card');
      const session = await createStripeCheckout({
        amount: total,
        returnUrl,
        label: 'Commande Go Pharma Pro',
      });
      if (session.demo) {
        setError('Stripe n’est pas encore configuré sur le serveur. Utilisez la carte de test 4242 4242 4242 4242.');
        return;
      }
      const browser = await WebBrowser.openAuthSessionAsync(session.url, returnUrl);
      if (browser.type === 'cancel' || browser.type === 'dismiss') return;
      if (browser.type === 'success') {
        finish('Visa · Stripe');
        return;
      }
      setError('Paiement Stripe interrompu.');
    } catch {
      setError('Impossible d’ouvrir Stripe. Essayez la carte de test.');
    } finally {
      setBusy(false);
    }
  };

  const payDemo = () => {
    setError('');
    if (!isStripeTestCard(number, expiry, cvc)) {
      setError('Carte invalide. En test : 4242 4242 4242 4242, expiration future, CVC à 3 chiffres.');
      return;
    }
    setBusy(true);
    setTimeout(() => finish(cardBrandLabel(number)), 700);
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.page}>
        <View style={s.badge}>
          <Text style={s.badgeText}>Stripe</Text>
        </View>
        <Text style={s.title}>Payer par carte</Text>
        <Text style={s.meta}>Visa et Mastercard. Le paiement est encaissé par Go Pharma Pro, puis réparti vers la pharmacie.</Text>
        <Card style={{ marginTop: 20 }}>
          <Text style={s.amount}>{total.toLocaleString('fr-FR')} FCFA</Text>
          <Text style={s.meta}>Marchand Go Pharma Pro · Gabon</Text>
        </Card>
        <View style={{ marginTop: 16 }}>
          <Button
            title={busy ? 'Ouverture de Stripe…' : 'Payer avec Stripe'}
            onPress={payHosted}
            disabled={busy}
          />
        </View>
        <Text style={s.or}>ou carte de test</Text>
        <Field
          label="Numéro de carte"
          value={number}
          onChange={(v) => setNumber(formatCardNumber(v))}
          placeholder="4242 4242 4242 4242"
          keyboardType="number-pad"
        />
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Field
              label="Expiration"
              value={expiry}
              onChange={(v) => setExpiry(formatCardExpiry(v))}
              placeholder="12/28"
              keyboardType="number-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="CVC" value={cvc} onChange={(v) => setCvc(v.replace(/\D/g, '').slice(0, 4))} placeholder="123" keyboardType="number-pad" />
          </View>
        </View>
        {error ? <Text style={s.error}>{error}</Text> : <Text style={s.hint}>Test Stripe : 4242 4242 4242 4242 · 12/28 · 123</Text>}
        <View style={{ marginTop: 8 }}>
          {busy ? <ActivityIndicator color={colors.primary} /> : <Button title="Valider la carte de test" kind="secondary" onPress={payDemo} />}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, paddingBottom: 40 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 14, backgroundColor: '#EEF0FF' },
  badgeText: { fontWeight: '800', color: '#635BFF' },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  amount: { fontSize: 28, fontWeight: '900', color: colors.text },
  or: { textAlign: 'center', marginVertical: 18, color: colors.muted, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  error: { color: colors.danger, fontWeight: '700', marginTop: 8, fontSize: 13, lineHeight: 18 },
  hint: { color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 18 },
});
