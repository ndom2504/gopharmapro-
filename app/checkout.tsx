import { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../src/components/UI';
import { ProductImage } from '../src/components/ProductImage';
import { LocationBar } from '../src/components/LocationBar';
import { useCart } from '../src/store/cart';
import { colors } from '../src/theme';
import { Fulfillment, PaymentMethodId } from '../src/types';
import {
  formatPhoneInput,
  isCardPayment,
  isGeniusPay,
  methodsForCountry,
  parseServicePhone,
  suggestPaymentMethod,
} from '../src/data/payments';
import { useGeoCatalog } from '../src/hooks/useGeoCatalog';
import { useCartRx } from '../src/hooks/useCartRx';
import { countryFromCoords, formatKm, locatePharmacy } from '../src/lib/geo';
import { countryMeta } from '../src/data/places';
import { RxPayBanner } from '../src/components/RxPayBanner';

export default function Checkout() {
  const items = useCart((s) => s.items);
  const change = useCart((s) => s.change);
  const remove = useCart((s) => s.remove);
  const subtotal = items.reduce((a, i) => a + i.offer.price * i.quantity, 0);
  const { gate, blocked } = useCartRx();
  const [method, setMethod] = useState<PaymentMethodId | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [picked, setPicked] = useState(false);
  const [fulfillment, setFulfillment] = useState<Fulfillment>('pickup');
  const { status, address, outsideGabon, refresh, coords } = useGeoCatalog();
  const pharmacy = items[0] ? locatePharmacy(items[0].offer.pharmacy, coords) : null;
  const payCountry =
    (pharmacy && countryFromCoords(pharmacy)) || countryFromCoords(coords || { latitude: 0, longitude: 0 }) || 'GA';
  const availableMethods = methodsForCountry(payCountry);
  const calling = countryMeta(payCountry).callingCode;
  const canPickup = pharmacy?.pickup !== false;
  const canDelivery = !!pharmacy?.delivery;
  const mode: Fulfillment = !canPickup && canDelivery ? 'delivery' : !canDelivery ? 'pickup' : fulfillment;
  const fee = mode === 'delivery' ? items[0]?.offer.pharmacy.fee || 0 : 0;
  const total = subtotal + fee;

  useEffect(() => {
    if (method && !availableMethods.some((m) => m.id === method)) {
      setMethod(null);
      setPicked(false);
    }
  }, [payCountry, method, availableMethods]);

  const onPhone = (value: string) => {
    const next = formatPhoneInput(value, payCountry);
    setPhone(next);
    setPhoneError('');
    const suggested = suggestPaymentMethod(next);
    if (suggested && !picked && availableMethods.some((m) => m.id === suggested)) setMethod(suggested);
  };

  const pay = () => {
    if (blocked) return;
    if (!method) {
      setPhoneError('Choisissez un moyen de paiement.');
      return;
    }
    if (isCardPayment(method)) {
      router.push({
        pathname: '/pay-card',
        params: { total: String(total), fulfillment: mode },
      });
      return;
    }
    const parsed = parseServicePhone(phone, payCountry);
    if (!parsed) {
      setPhoneError(
        payCountry === 'BJ'
          ? 'Entrez un numéro béninois valide, ex. 97 12 34 56.'
          : 'Entrez un numéro valide pour ce pays.',
      );
      return;
    }
    if (isGeniusPay(method)) {
      router.push({
        pathname: '/pay-genius',
        params: { phone: parsed.display, total: String(total), fulfillment: mode },
      });
      return;
    }
    router.push({
      pathname: '/pay',
      params: { method, phone: parsed.display, total: String(total), fulfillment: mode },
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
          <Text style={s.name}>Mode de réception</Text>
          <Text style={s.meta}>Le livreur est optionnel. Choisissez le retrait ou la livraison.</Text>
          <View style={s.modes}>
            {canPickup ? (
              <Pressable onPress={() => setFulfillment('pickup')} style={[s.mode, mode === 'pickup' && s.modeOn]}>
                <Ionicons name="storefront-outline" size={22} color={mode === 'pickup' ? colors.primary : colors.muted} />
                <Text style={[s.modeTitle, mode === 'pickup' && { color: colors.primary }]}>Retrait</Text>
                <Text style={s.modeMeta}>Vous venez en pharmacie. Un code au comptoir, sans livreur.</Text>
              </Pressable>
            ) : null}
            {canDelivery ? (
              <Pressable onPress={() => setFulfillment('delivery')} style={[s.mode, mode === 'delivery' && s.modeOn]}>
                <Ionicons name="bicycle-outline" size={22} color={mode === 'delivery' ? colors.primary : colors.muted} />
                <Text style={[s.modeTitle, mode === 'delivery' && { color: colors.primary }]}>Livraison</Text>
                <Text style={s.modeMeta}>Un livreur ramasse avec un code, puis vous lui donnez le vôtre.</Text>
              </Pressable>
            ) : null}
          </View>
          {mode === 'delivery' ? (
            <>
              <Text style={[s.meta, { marginTop: 10 }]}>{address || 'Activez la localisation pour l’adresse de livraison.'}</Text>
              {pharmacy?.area ? <Text style={s.meta}>Pharmacie : {pharmacy.area}</Text> : null}
            </>
          ) : (
            <Text style={[s.meta, { marginTop: 10 }]}>Retrait à {pharmacy?.name}{pharmacy?.area ? ' · ' + pharmacy.area : ''}.</Text>
          )}
        </Card>
        {items.map((i) => (
          <Card key={i.offer.id} style={{ marginTop: 13 }}>
            <View style={s.row}>
              <ProductImage uris={i.product.imageUris} imageKey={i.product.imageKey || i.product.id} category={i.product.category} size="thumb" />
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
        <RxPayBanner />
        <Card style={{ marginTop: 16 }}>
          <View style={s.row}>
            <Text>Sous-total</Text>
            <Text>{subtotal.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={s.row}>
            <Text>{mode === 'delivery' ? 'Livraison' : 'Retrait'}</Text>
            <Text>{fee.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={[s.row, { marginTop: 12 }]}>
            <Text style={s.name}>Total</Text>
            <Text style={s.total}>{total.toLocaleString('fr-FR')} FCFA</Text>
          </View>
        </Card>
        <Text style={s.section}>Paiement</Text>
        <Text style={s.meta}>
          {payCountry === 'BJ'
            ? 'Au Bénin : GeniusPay (MTN MoMo, Moov Money) ou carte. Le montant est encaissé par Go Pharma Pro.'
            : 'Mobile money, ou carte Visa / Mastercard. Le montant est encaissé par Go Pharma Pro.'}
        </Text>
        {availableMethods.map((m) => {
          const selected = method === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => {
                setMethod(m.id);
                setPicked(true);
                if (m.id === 'card' || m.id === 'geniuspay') setPhoneError('');
              }}
              style={[s.payCard, selected && { borderColor: m.color, backgroundColor: m.background }]}
            >
              <View style={[s.logo, { backgroundColor: m.color }]}>
                <Text style={s.logoText}>{m.short}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.payName}>{m.name}</Text>
                <Text style={s.payMeta}>{m.ussd ? m.operator + ' · ' + m.ussd : m.operator}</Text>
              </View>
              <View style={[s.radio, selected && { borderColor: m.color, backgroundColor: m.color }]} />
            </Pressable>
          );
        })}
        {method && !isCardPayment(method) ? (
          <>
            <Text style={s.label}>Numéro du compte mobile money</Text>
            <View style={[s.phoneBox, phoneError ? { borderColor: colors.danger } : null]}>
              <Text style={s.prefix}>{calling}</Text>
              <TextInput
                value={phone}
                onChangeText={onPhone}
                placeholder={payCountry === 'BJ' ? '97 12 34 56' : '77 12 34 56'}
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
                style={s.phoneInput}
              />
            </View>
            {phoneError ? (
              <Text style={s.error}>{phoneError}</Text>
            ) : (
              <Text style={s.hint}>
                Indicatif {calling} déjà inclus. Le 0 local n’est pas nécessaire.
                {isGeniusPay(method) ? ' GeniusPay ouvrira MTN MoMo ou Moov Money.' : ''}
              </Text>
            )}
          </>
        ) : method === 'card' ? (
          <Text style={s.hint}>Vous serez redirigé vers Stripe, ou pourrez saisir une carte de test (4242…).</Text>
        ) : phoneError ? (
          <Text style={s.error}>{phoneError}</Text>
        ) : null}
        <View style={{ marginTop: 18 }}>
          <Button
            title={blocked ? (gate === 'pending' ? 'En attente de validation' : 'Paiement désactivé jusqu’à validation') : 'Payer ' + total.toLocaleString('fr-FR') + ' FCFA'}
            disabled={blocked}
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
  modes: { flexDirection: 'row', gap: 10, marginTop: 12 },
  mode: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#fff',
    gap: 6,
  },
  modeOn: { borderColor: colors.primary, backgroundColor: colors.mint },
  modeTitle: { fontWeight: '900', color: colors.text, fontSize: 15 },
  modeMeta: { color: colors.muted, fontSize: 12, lineHeight: 17 },
});
