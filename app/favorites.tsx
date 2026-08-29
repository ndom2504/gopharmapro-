import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, ScreenTitle } from '../src/components/UI';
import { PharmacyFeedback } from '../src/components/PharmacyFeedback';
import { colors } from '../src/theme';
import { useFavorites } from '../src/store/favorites';
import { pharmacies, products } from '../src/data/mock';

export default function Favorites() {
  const pharmacyIds = useFavorites((s) => s.pharmacies);
  const productIds = useFavorites((s) => s.products);
  const togglePharmacy = useFavorites((s) => s.togglePharmacy);
  const toggleProduct = useFavorites((s) => s.toggleProduct);
  const favPharmacies = pharmacies.filter((p) => pharmacyIds.includes(p.id));
  const favProducts = products.filter((p) => productIds.includes(p.id));

  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Mes favoris" subtitle="Pharmacies et produits sauvegardés." />
      <Text style={s.section}>Pharmacies</Text>
      {favPharmacies.length === 0 ? <Text style={s.meta}>Aucune pharmacie favorite.</Text> : null}
      {favPharmacies.map((p) => (
        <Card key={p.id} style={{ marginBottom: 10 }}>
          <Text style={s.name}>{p.name}</Text>
          <Text style={s.meta}>{p.area}</Text>
          <PharmacyFeedback pharmacyId={p.id} name={p.name} baseRating={p.rating} reviewCount={p.reviewCount} />
          <View style={{ marginTop: 12, gap: 8 }}>
            <Button title="Voir pharmacie" onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: p.id } })} />
            <Pressable onPress={() => togglePharmacy(p.id)}>
              <Text style={s.remove}>Retirer</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      <Text style={s.section}>Produits</Text>
      {favProducts.length === 0 ? <Text style={s.meta}>Aucun produit favori.</Text> : null}
      {favProducts.map((p) => (
        <Card key={p.id} style={{ marginBottom: 10 }}>
          <Text style={s.name}>{p.name}</Text>
          <View style={{ marginTop: 12, gap: 8 }}>
            <Button title="Voir le produit" kind="secondary" onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} />
            <Pressable onPress={() => toggleProduct(p.id)}>
              <Text style={s.remove}>Retirer</Text>
            </Pressable>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 40 },
  section: { fontWeight: '800', color: colors.text, fontSize: 16, marginTop: 8, marginBottom: 10 },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4 },
  remove: { color: colors.danger, fontWeight: '700' },
});
