import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Card } from '../src/components/UI';
import { useCart } from '../src/store/cart';
import { settlePaidOrder } from '../src/lib/settlement';
import { buildPayment, orderFromCart, useOrders } from '../src/store/orders';
import { colors } from '../src/theme';
import { Fulfillment, PaymentMethodId } from '../src/types';
import { getPaymentMethod } from '../src/data/payments';
import { useLocation } from '../src/store/location';

export default function Pay() {
  const params = useLocalSearchParams<{ method?: PaymentMethodId; phone?: string; total?: string; fulfillment?: string }>();
  const method = getPaymentMethod((params.method as PaymentMethodId) || 'airtel-money');
  const phone = params.phone || '';
  const fulfillment: Fulfillment = params.fulfillment === 'delivery' ? 'delivery' : 'pickup';
  const total = Number(params.total || 0);
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.add);
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!items.length) return;
    const t1 = setTimeout(() => setStep(1), 900);
    const t2 = setTimeout(() => setStep(2), 2200);
    const t3 = setTimeout(() => {
      if (done.current) return;
      done.current = true;
      const subtotal = items.reduce((a, i) => a + i.offer.price * i.quantity, 0);
      const address = useLocation.getState().address || 'Adresse à confirmer · Gabon';
      const order = addOrder(
        orderFromCart(items, buildPayment(method.name, method.id, phone), subtotal, address, fulfillment),
      );
      settlePaidOrder(order);
      clear();
      router.replace({ pathname: '/order/[id]', params: { id: order.id } });
    }, 3400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [items.length]);

  const openUssd = () => {
    const code = method.ussd.replace('#', '%23');
    Linking.openURL('tel:' + code).catch(() => setFailed(true));
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

  const steps = ['Demande envoyée à ' + method.operator, 'Validez avec votre code PIN', 'Confirmation du paiement'];

  return (
    <View style={s.page}>
      <View style={[s.badge, { backgroundColor: method.background }]}>
        <Text style={[s.badgeText, { color: method.color }]}>{method.name}</Text>
      </View>
      <Text style={s.title}>Confirmez sur votre téléphone</Text>
      <Text style={s.meta}>
        Un message {method.name} est envoyé au {phone}. {method.hint}
      </Text>
      <Card style={{ marginTop: 22 }}>
        <Text style={s.amount}>{total.toLocaleString('fr-FR')} FCFA</Text>
        <Text style={s.meta}>Marchand Go Pharma Pro · Gabon</Text>
        <View style={{ marginTop: 18 }}>
          {steps.map((label, i) => (
            <View key={label} style={s.step}>
              <View style={[s.dot, i <= step && { backgroundColor: method.color, borderColor: method.color }]}>
                {i < step ? <Text style={s.check}>✓</Text> : i === step ? <ActivityIndicator color="#fff" size="small" /> : null}
              </View>
              <Text style={[s.stepLabel, i > step && { color: colors.muted }]}>{label}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Text style={s.ussd}>
        Si la demande n’apparaît pas, composez {method.ussd} puis validez le paiement marchand.
      </Text>
      {failed ? <Text style={s.fail}>Impossible d’ouvrir le composeur. Saisissez {method.ussd} manuellement.</Text> : null}
      <View style={{ marginTop: 16 }}>
        <Button title={'Composer ' + method.ussd} kind="secondary" onPress={openUssd} />
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
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  check: { color: '#fff', fontWeight: '900', fontSize: 12 },
  stepLabel: { fontWeight: '700', color: colors.text, flex: 1 },
  ussd: { marginTop: 18, color: colors.muted, lineHeight: 20 },
  fail: { marginTop: 10, color: colors.danger, fontWeight: '700' },
});
