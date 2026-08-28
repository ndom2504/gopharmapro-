import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { pharmacies } from '../../src/data/mock';
import { Badge, Card } from '../../src/components/UI';
import { ProductImage } from '../../src/components/ProductImage';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm, locatePharmacy } from '../../src/lib/geo';

export default function Pharmacy() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { coords, locatedProducts } = useGeoCatalog();
  const p = locatePharmacy(pharmacies.find((x) => x.id === id) || pharmacies[0], coords);
  const offers = locatedProducts.flatMap((product) =>
    product.offers.filter((o) => o.pharmacy.id === p.id).map((o) => ({ product, o })),
  );
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.hero}>
        <Text style={{ fontSize: 54 }}>⚕️</Text>
      </View>
      <View style={s.row}>
        <Text style={s.title}>{p.name}</Text>
        <Badge text={p.open ? 'Ouverte' : 'Fermée'} tone={p.open ? 'green' : 'red'} />
      </View>
      <Text style={s.meta}>
        ★ {p.rating} · {formatKm(p.distance)} · {p.eta}
      </Text>
      <Text style={s.meta}>{p.area}</Text>
      <Card style={{ marginTop: 18 }}>
        <Text style={s.info}>{p.delivery ? '✓ Livraison disponible' : '- Pas de livraison'}</Text>
        <Text style={s.info}>✓ Retrait en pharmacie</Text>
        <Text style={s.info}>Frais de livraison : {p.fee.toLocaleString('fr-FR')} FCFA</Text>
      </Card>
      <Text style={s.section}>Produits</Text>
      {offers.map(({ product, o }) => (
        <Pressable key={o.id} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}>
          <Card style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <ProductImage uris={product.imageUris} imageKey={product.imageKey || product.id} category={product.category} size="thumb" />
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{product.name}</Text>
                <Text style={s.meta}>Stock {o.stock}</Text>
              </View>
              <Text style={s.price}>{o.price.toLocaleString('fr-FR')} FCFA</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  hero: { height: 160, backgroundColor: colors.mint, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 25, fontWeight: '900', color: colors.text, flex: 1 },
  meta: { color: colors.muted, marginTop: 7 },
  info: { fontWeight: '700', color: colors.text, marginVertical: 5 },
  section: { fontSize: 20, fontWeight: '900', color: colors.text, marginVertical: 20 },
  name: { fontWeight: '800', color: colors.text },
  price: { fontWeight: '900', color: colors.primary },
});
