import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Button, Card } from '../src/components/UI';
import { LocationBar } from '../src/components/LocationBar';
import { useCart } from '../src/store/cart';
import { colors } from '../src/theme';
import { PaymentMethodId } from '../src/types';
import { formatPhoneInput, parseGabonPhone, paymentMethods, suggestPaymentMethod } from '../src/data/payments';
import { useGeoCatalog } from '../src/hooks/useGeoCatalog';
import { formatKm, locatePharmacy } from '../src/lib/geo';

export default function Checkout() {
  const items = useCart((s) => s.items);
  const change = useCart((s) => s.change);
  const remove = useCart((s) => s.remove);
  const subtotal = items.reduce((a, i) => a + i.offer.price * i.quantity, 0);
  const fee = items[0]?.offer.pharmacy.fee || 0;
  const total = subtotal + fee;
  const rx = items.some((i) => i.product.requiresPrescription);
  const [method, setMethod] = useState<PaymentMethodId | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [picked, setPicked] = useState(false);
  const { status, address, outsideGabon, refresh, coords } = useGeoCatalog();
  const pharmacy = items[0] ? locatePharmacy(items[0].offer.pharmacy, coords) : null;

  const onPhone = (value: string) => {
    const next = formatPhoneInput(value);
    setPhone(next);
    setPhoneError('');
    const suggested = suggestPaymentMethod(next);
    if (suggested && !picked) setMethod(suggested);
  };

  const pay = () => {
    if (!method) {
      setPhoneError('Choisissez MobiCash, Airtel Money ou Moov Money.');
      return;
    }
    const parsed = parseGabonPhone(phone);
    if (!parsed) {
      setPhoneError('Entrez un numéro gabonais valide, ex. 77 12 34 56.');
      return;
    }
    router.push({
      pathname: '/pay',
      params: { method, phone: parsed.display, total: String(total) },
    });
  };

  if (!items.length) {
    return (
      <View style={s.empty}>
        <Text style={s.title}>Votre panier est vide</Text>
        <Button title="Rechercher des produits" onPress={() => router.replace('/(tabs)/search')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Votre panier</Text>
        <Text style={s.meta}>
          {pharmacy?.name}
          {pharmacy ? ' · ' + formatKm(pharmacy.distance) + ' · ' + pharmacy.eta : ''}
        </Text>
        <View style={{ marginTop: 14 }}>
          <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
        </View>
        <Card style={{ marginTop: 8 }}>
          <Text style={s.name}>Livraison</Text>
          <Text style={s.meta}>{address || 'Activez la localisation pour préremplir l’adresse de livraison.'}</Text>
          {pharmacy?.area ? <Text style={s.meta}>Pharmacie : {pharmacy.area}</Text> : null}
        </Card>
        {items.map((i) => (
          <Card key={i.offer.id} style={{ marginTop: 13 }}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{i.product.name}</Text>
                <Text style={s.meta}>{i.offer.price.toLocaleString('fr-FR')} FCFA / unité</Text>
              </View>
              <View style={s.qty}>
                <Text onPress={() => change(i.offer.id, -1)} style={s.control}>
                  −
                </Text>
                <Text style={s.number}>{i.quantity}</Text>
                <Text onPress={() => change(i.offer.id, 1)} style={s.control}>
                  +
                </Text>
              </View>
            </View>
            <Text onPress={() => remove(i.offer.id)} style={s.remove}>
              Retirer
            </Text>
          </Card>
        ))}
        {rx ? (
          <Card style={s.rx}>
            <Text style={s.rxTitle}>Ordonnance requise</Text>
            <Text style={s.meta}>Transmettez votre ordonnance. Aucun paiement ne sera demandé avant son approbation.</Text>
            <View style={{ marginTop: 13 }}>
              <Button title="Téléverser l’ordonnance" kind="secondary" onPress={() => router.push('/prescription')} />
            </View>
          </Card>
        ) : null}
        <Card style={{ marginTop: 16 }}>
          <View style={s.row}>
            <Text>Sous-total</Text>
            <Text>{subtotal.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={s.row}>
            <Text>Livraison</Text>
            <Text>{fee.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={[s.row, { marginTop: 12 }]}>
            <Text style={s.name}>Total</Text>
            <Text style={s.total}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </Card>
        <Text style={s.section}>Paiement mobile — Gabon</Text>
        <Text style={s.meta}>Payez par MobiCash, Airtel Money ou Moov Money. Un message USSD sera envoyé sur votre téléphone pour valider avec votre PIN.</Text>
        {paymentMethods.map((m) => {
          const selected = method === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                setMethod(m.id);
                setPicked(true);
              }}
              style={[s.payCard, selected && { borderColor: m.color, backgroundColor: m.background }]}
            >
              <View style={[s.logo, { backgroundColor: m.color }]}>
                <Text style={s.logoText}>{m.short}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.payName}>{m.name}</Text>
                <Text style={s.payMeta}>
                  {m.operator} · {m.ussd}
                </Text>
              </View>
              <View style={[s.radio, selected && { borderColor: m.color, backgroundColor: m.color }]} />
            </Pressable>
          );
        })}
        <Text style={s.label}>Numéro du compte mobile money</Text>
        <View style={[s.phoneBox, phoneError ? { borderColor: colors.danger } : null]}>
          <Text style={s.prefix}>+241</Text>
          <TextInput
            value={phone}
            onChangeText={onPhone}
            placeholder="77 12 34 56"
            placeholderTextColor="#89958F"
            keyboardType="phone-pad"
            style={s.phoneInput}
          />
        </View>
        {phoneError ? <Text style={s.error}>{phoneError}</Text> : <Text style={s.hint}>Indicatif Gabon +241 déjà inclus. Le 0 local n’est pas nécessaire.</Text>}
        <View style={{ marginTop: 18 }}>
          <Button
            title={rx ? 'Paiement bloqué - ordonnance à valider' : 'Payer ' + total.toLocaleString('fr-FR') + ' FCFA'}
            disabled={rx}
            onPress={pay}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  empty: { flex: 1, padding: 30, justifyContent: 'center', gap: 20 },
  title: { fontSize: 27, fontWeight: '900', color: colors.text },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 26, marginBottom: 6 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { color: colors.muted, marginTop: 5, lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginVertical: 5 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  control: { fontSize: 22, fontWeight: '900', color: colors.primary, backgroundColor: colors.mint, width: 34, height: 34, textAlign: 'center', borderRadius: 10 },
  number: { fontWeight: '800' },
  remove: { color: colors.danger, fontWeight: '700', marginTop: 12 },
  rx: { marginTop: 16, backgroundColor: '#FFF5F5', borderColor: '#FFC9C9' },
  rxTitle: { color: colors.danger, fontWeight: '900' },
  total: { fontSize: 19, fontWeight: '900', color: colors.primary },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  logo: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  payName: { fontWeight: '800', color: colors.text, fontSize: 16 },
  payMeta: { color: colors.muted, marginTop: 3, fontSize: 13 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  label: { fontWeight: '800', color: colors.text, marginTop: 18, marginBottom: 8 },
  phoneBox: {
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  prefix: { fontWeight: '800', color: colors.text, fontSize: 16 },
  phoneInput: { flex: 1, fontSize: 16, color: colors.text },
  hint: { color: colors.muted, fontSize: 12, marginTop: 8, lineHeight: 18 },
  error: { color: colors.danger, fontWeight: '700', marginTop: 8, fontSize: 13 },
});
