import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, ScreenTitle } from '../../src/components/UI';
import { ProductImage } from '../../src/components/ProductImage';
import { RxPayBanner } from '../../src/components/RxPayBanner';
import { useCart } from '../../src/store/cart';
import { useCartRx } from '../../src/hooks/useCartRx';
import { colors } from '../../src/theme';

export default function CartTab() {
  const items = useCart((s) => s.items);
  const change = useCart((s) => s.change);
  const remove = useCart((s) => s.remove);
  const { gate, blocked } = useCartRx();
  const subtotal = items.reduce((a, i) => a + i.offer.price * i.quantity, 0);
  const canDelivery = !!items[0]?.offer.pharmacy.delivery;
  const fee = canDelivery ? items[0]?.offer.pharmacy.fee || 0 : 0;
  const total = subtotal + fee;

  if (!items.length) {
    return (
      <View style={s.empty}>
        <ScreenTitle title="Mon panier" subtitle="Ajoutez un médicament depuis la recherche." />
        <Button title="Rechercher un médicament" onPress={() => router.replace('/(tabs)/search')} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Mon panier" subtitle={items[0].offer.pharmacy.name} />
      {items.map((i) => (
        <Card key={i.offer.id} style={{ marginBottom: 12 }}>
          <View style={s.row}>
            <ProductImage uris={i.product.imageUris} imageKey={i.product.imageKey || i.product.id} category={i.product.category} size="thumb" />
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{i.product.name}</Text>
              <Text style={s.meta}>
                × {i.quantity} · {(i.offer.price * i.quantity).toLocaleString('fr-FR')} FCFA
              </Text>
              {i.product.requiresPrescription ? <Badge text="Ordonnance" tone="red" /> : null}
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
          <Pressable onPress={() => remove(i.offer.id)}>
            <Text style={s.remove}>Retirer</Text>
          </Pressable>
        </Card>
      ))}
      <Card>
        <View style={s.rowBetween}>
          <Text style={s.meta}>Sous-total</Text>
          <Text style={s.meta}>{subtotal.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View style={s.rowBetween}>
          <Text style={s.meta}>Livraison</Text>
          <Text style={s.meta}>{fee.toLocaleString('fr-FR')} FCFA</Text>
        </View>
        <View style={[s.rowBetween, { marginTop: 10 }]}>
          <Text style={s.name}>TOTAL</Text>
          <Text style={s.total}>{total.toLocaleString('fr-FR')} FCFA</Text>
        </View>
      </Card>
      <RxPayBanner />
      <View style={{ marginTop: 16 }}>
        <Button
          title={blocked ? (gate === 'pending' ? 'En attente de validation' : 'Paiement bloqué') : 'Commander'}
          disabled={blocked}
          onPress={() => {
            if (blocked) {
              Alert.alert(
                'Ordonnance requise',
                gate === 'pending'
                  ? 'La pharmacie n’a pas encore validé le fichier.'
                  : 'Transmettez d’abord votre ordonnance. Le paiement reste bloqué.',
              );
              return;
            }
            router.push('/checkout');
          }}
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  empty: { flex: 1, padding: 20, paddingTop: 58, justifyContent: 'center', gap: 16 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { color: colors.muted, marginTop: 4, fontWeight: '700' },
  qty: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  control: { fontSize: 20, fontWeight: '900', color: colors.primary, backgroundColor: colors.mint, width: 32, height: 32, textAlign: 'center', borderRadius: 10 },
  number: { fontWeight: '800', minWidth: 18, textAlign: 'center' },
  remove: { color: colors.danger, fontWeight: '700', marginTop: 10 },
  total: { fontSize: 18, fontWeight: '900', color: colors.primary },
});
