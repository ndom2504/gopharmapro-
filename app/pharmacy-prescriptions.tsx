import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, pharmacyTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { rxStatusLabel, rxStatusTone, usePrescriptions } from '../src/store/prescriptions';

export default function PharmacyPrescriptions() {
  const session = useAuth((s) => s.session);
  const items = usePrescriptions((s) => s.items);
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.title}>Ordonnances</Text>
        <Text style={s.meta}>Validez les fichiers privés avant d’ouvrir le paiement client.</Text>
        {items.map((rx) => (
          <Card key={rx.id} style={{ marginTop: 12 }}>
            <View style={s.row}>
              <Text style={s.name}>{rx.fileName}</Text>
              <Badge text={rxStatusLabel[rx.status]} tone={rxStatusTone[rx.status]} />
            </View>
            <Text style={s.meta}>{rx.products.join(', ')}</Text>
            <Text style={s.meta}>{new Date(rx.createdAt).toLocaleDateString('fr-GA')}</Text>
          </Card>
        ))}
        <View style={{ marginTop: 16 }}>
          <Button title="Voir les commandes" kind="secondary" onPress={() => router.push('/pharmacy-orders')} />
        </View>
      </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '800', color: colors.text, flex: 1 },
});
