import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/UI';
import { useCart } from '../../src/store/cart';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm } from '../../src/lib/geo';

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locatedProducts } = useGeoCatalog();
  const p = locatedProducts.find((x) => x.id === id) || locatedProducts[0];
  const add = useCart((s) => s.add);
  const onAdd = (o: (typeof p.offers)[number]) => {
    const r = add(p, o);
    r === 'different-pharmacy'
      ? Alert.alert('Panier lié à une autre pharmacie', 'Créez un nouveau panier pour commander auprès de cette pharmacie.')
      : router.push('/checkout');
  };
  const offers = [...p.offers].sort((a, b) => a.pharmacy.distance - b.pharmacy.distance);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.visual}>
        <Text style={{ fontSize: 68 }}>💊</Text>
      </View>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{p.name}</Text>
          <Text style={s.meta}>
            {p.genericName} · {p.form}
          </Text>
        </View>
        {p.requiresPrescription ? <Badge text="Ordonnance requise" tone="red" /> : <Badge text="Sans ordonnance" />}
      </View>
      {p.requiresPrescription ? (
        <Card style={s.alert}>
          <Text style={s.alertTitle}>Médicament sur ordonnance</Text>
          <Text style={s.meta}>Le paiement restera bloqué jusqu'à la validation par la pharmacie.</Text>
        </Card>
      ) : null}
      <Text style={s.section}>À propos</Text>
      <Text style={s.desc}>{p.description}</Text>
      <Text style={s.section}>Choisir une pharmacie</Text>
      {offers.map((o) => (
        <Card key={o.id} style={{ marginBottom: 12 }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.offer}>{o.pharmacy.name}</Text>
              <Text style={s.meta}>
                {formatKm(o.pharmacy.distance)} · {o.pharmacy.area} · Stock {o.stock}
              </Text>
            </View>
            <Text style={s.price}>{o.price.toLocaleString('fr-FR')} FCFA</Text>
          </View>
          <View style={{ marginTop: 14 }}>
            <Button title={o.stock ? 'Ajouter au panier' : 'Indisponible'} disabled={!o.stock} onPress={() => onAdd(o)} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  visual: { height: 180, borderRadius: 24, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { fontSize: 25, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  alert: { marginTop: 18, backgroundColor: '#FFF5F5', borderColor: '#FFC9C9' },
  alertTitle: { color: colors.danger, fontWeight: '900' },
  section: { fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 24, marginBottom: 10 },
  desc: { color: colors.muted, lineHeight: 22 },
  offer: { fontWeight: '800', fontSize: 16, color: colors.text },
  price: { fontWeight: '900', fontSize: 16, color: colors.primary },
});
