import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';
import { CourierAccount, PharmacyAccount } from '../src/types';

export default function AdminVerifications() {
  const session = useAuth((s) => s.session);
  const directory = useAuth((s) => s.directory);
  const catalog = usePharmacyCatalog((s) => s.items);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;
  const pharmacies = directory.filter((a): a is PharmacyAccount => a.role === 'pharmacy' && a.status === 'pending');
  const couriers = directory.filter((a): a is CourierAccount => a.role === 'courier' && a.status === 'pending');
  const review = catalog.filter((i) => i.status === 'review');

  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Vérifications" />
      <Text style={s.section}>Pharmacies</Text>
      {pharmacies.map((p) => (
        <Card key={p.id} style={{ marginTop: 10 }}>
          <Text style={s.name}>{p.pharmacyName}</Text>
          <Badge text="En attente" tone="orange" />
          <View style={{ marginTop: 12 }}>
            <Button title="Ouvrir le dossier" kind="secondary" onPress={() => router.push({ pathname: '/admin-pharmacy/[id]', params: { id: p.id } })} />
          </View>
        </Card>
      ))}
      <Text style={s.section}>Livreurs</Text>
      {couriers.map((c) => (
        <Card key={c.id} style={{ marginTop: 10 }}>
          <Text style={s.name}>
            {c.firstName} {c.lastName}
          </Text>
          <Badge text="En attente" tone="orange" />
        </Card>
      ))}
      <Text style={s.section}>Produits</Text>
      {review.map((i) => (
        <Card key={i.id} style={{ marginTop: 10 }}>
          <Text style={s.name}>{i.name}</Text>
          <Text style={s.meta}>{i.pharmacyName}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 40 },
  section: { fontWeight: '800', color: colors.text, marginTop: 18, marginBottom: 4 },
  name: { fontWeight: '800', color: colors.text, fontSize: 16, marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 4 },
});
