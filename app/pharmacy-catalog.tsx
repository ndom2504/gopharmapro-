import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card } from '../src/components/UI';
import { ProductImage } from '../src/components/ProductImage';
import { RoleTabBar, pharmacyTabs, useTabScreenPad } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';
import { regulatoryLabel, regulatoryTone, resolveStatus } from '../src/lib/taxonomy';

export default function PharmacyCatalog() {
  const session = useAuth((s) => s.session);
  const items = usePharmacyCatalog((s) => s.items);
  const updateStock = usePharmacyCatalog((s) => s.updateStock);
  const tabPad = useTabScreenPad();
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;
  if (session.status !== 'verified') return <Redirect href="/pharmacy-home" />;

  const catalog = items.filter((i) => i.pharmacyId === session.id);

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={[s.page, { paddingBottom: tabPad }]}>
      <Text style={s.title}>Produits de l’officine</Text>
      <Text style={s.meta}>Catégorie commerciale et statut réglementaire sont distincts. Un produit sur ordonnance ou à contrôle requis passe en revue avant publication.</Text>
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <Button title="Ajouter un produit" onPress={() => router.push('/pharmacy-product-new')} />
      </View>
      {catalog.length === 0 ? (
        <Card style={{ marginTop: 12 }}>
          <Text style={s.empty}>Aucun produit pour le moment.</Text>
        </Card>
      ) : (
        catalog.map((item) => (
          <Card key={item.id} style={{ marginTop: 12 }}>
            <View style={s.row}>
              <ProductImage uris={item.imageUris} imageKey={item.imageKey || item.id} category={item.category} size="thumb" />
              <View style={{ flex: 1 }}>
                <View style={s.row}>
                  <Text style={s.name}>{item.name}</Text>
                  <Badge
                    text={item.status === 'published' ? 'Publié' : 'En contrôle'}
                    tone={item.status === 'published' ? 'green' : 'orange'}
                  />
                </View>
                <Text style={s.meta}>
                  {item.form} · {item.dosage} · {item.category}
                  {item.subcategory ? ` · ${item.subcategory}` : ''}
                </Text>
                <Text style={s.price}>{item.price.toLocaleString('fr-FR')} FCFA</Text>
                <View style={{ marginTop: 8 }}>
                  <Badge text={regulatoryLabel(resolveStatus(item))} tone={regulatoryTone(resolveStatus(item))} />
                </View>
                <View style={s.stockRow}>
                  <Pressable onPress={() => updateStock(item.id, Math.max(0, item.stock - 1))} style={s.stockBtn}>
                    <Ionicons name="remove" size={16} color={colors.primary} />
                  </Pressable>
                  <Text style={s.stock}>Stock {item.stock}</Text>
                  <Pressable onPress={() => updateStock(item.id, item.stock + 1)} style={s.stockBtn}>
                    <Ionicons name="add" size={16} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { flex: 1, fontWeight: '800', color: colors.text, fontSize: 16 },
  price: { marginTop: 8, fontWeight: '800', color: colors.primary },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  stockBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stock: { fontWeight: '800', color: colors.text, minWidth: 70 },
  empty: { color: colors.muted, fontWeight: '700' },
  back: { textAlign: 'center', color: colors.primary, fontWeight: '800' },
});
