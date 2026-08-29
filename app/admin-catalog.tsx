import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { ProductImage } from '../src/components/ProductImage';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';

export default function AdminCatalog() {
  const session = useAuth((s) => s.session);
  const items = usePharmacyCatalog((s) => s.items);
  const setStatus = usePharmacyCatalog((s) => s.setStatus);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;
  const ordered = [...items].sort((a, b) => Number(a.status === 'published') - Number(b.status === 'published'));
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Catalogue" />
      <Text style={s.meta}>Les produits avec ordonnance restent en contrôle jusqu’à validation.</Text>
      {ordered.map((item) => (
        <Card key={item.id} style={{ marginTop: 12 }}>
          <View style={s.row}>
            <ProductImage uris={item.imageUris} imageKey={item.imageKey || item.id} category={item.category} size="thumb" />
            <View style={{ flex: 1 }}>
              <View style={s.row}>
                <Text style={s.name}>{item.name}</Text>
                <Badge
                  text={item.status === 'published' ? 'Publié' : 'Contrôle'}
                  tone={item.status === 'published' ? 'green' : 'orange'}
                />
              </View>
              <Text style={s.meta}>
                {item.pharmacyName} · {item.category}
                {item.requiresPrescription ? ' · Ordonnance' : ''}
              </Text>
              {item.status === 'review' ? (
                <View style={{ marginTop: 10 }}>
                  <Button title="Publier" onPress={() => setStatus(item.id, 'published')} />
                </View>
              ) : (
                <View style={{ marginTop: 10 }}>
                  <Button title="Remettre en contrôle" kind="secondary" onPress={() => setStatus(item.id, 'review')} />
                </View>
              )}
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { flex: 1, fontWeight: '800', color: colors.text, fontSize: 16 },
});
