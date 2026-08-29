import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { PharmacyAccount } from '../src/types';

export default function AdminPharmacies() {
  const session = useAuth((s) => s.session);
  const directory = useAuth((s) => s.directory);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;
  const list = directory.filter((a): a is PharmacyAccount => a.role === 'pharmacy');
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Pharmacies" />
      <Text style={s.meta}>Vérifiez les documents, puis acceptez ou rejetez le dossier.</Text>
      {list.map((p) => (
        <Pressable key={p.id} onPress={() => router.push({ pathname: '/admin-pharmacy/[id]', params: { id: p.id } })}>
          <Card style={{ marginTop: 12 }}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{p.pharmacyName}</Text>
                <Text style={s.meta}>
                  {p.area}, {p.city} · {p.email}
                </Text>
              </View>
              <Badge
                text={p.status === 'verified' ? 'Vérifiée' : p.status === 'rejected' ? 'Rejetée' : 'En attente'}
                tone={p.status === 'verified' ? 'green' : p.status === 'rejected' ? 'red' : 'orange'}
              />
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
});
