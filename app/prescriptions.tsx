import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, ScreenTitle } from '../src/components/UI';
import { colors } from '../src/theme';
import { rxStatusLabel, rxStatusTone, usePrescriptions } from '../src/store/prescriptions';

export default function Prescriptions() {
  const items = usePrescriptions((s) => s.items);
  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Mes ordonnances" subtitle="Suivi des fichiers transmis aux pharmacies." />
      <Button title="Ajouter une ordonnance" onPress={() => router.push('/prescription')} />
      <View style={{ height: 16 }} />
      {items.map((rx) => (
        <Card key={rx.id} style={{ marginBottom: 12 }}>
          <View style={s.row}>
            <Text style={s.name}>{rx.fileName}</Text>
            <Badge text={rxStatusLabel[rx.status]} tone={rxStatusTone[rx.status]} />
          </View>
          <Text style={s.meta}>🏥 {rx.pharmacyName}</Text>
          <Text style={s.meta}>{new Date(rx.createdAt).toLocaleDateString('fr-GA')}</Text>
          <Text style={s.meta}>{rx.products.join(', ')}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '800', color: colors.text, flex: 1 },
  meta: { color: colors.muted, marginTop: 6 },
});
