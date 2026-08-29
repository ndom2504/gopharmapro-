import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Button, Card, ScreenTitle } from '../src/components/UI';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePrescriptions, rxStatusLabel, rxStatusTone } from '../src/store/prescriptions';

export default function Prescriptions() {
  const session = useAuth((s) => s.session);
  const items = usePrescriptions((s) => s.items);
  const mine = session?.role === 'client' ? items.filter((r) => r.clientId === session.id) : items;

  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Mes ordonnances" subtitle="Suivi des fichiers transmis aux pharmacies." />
      <Button title="Ajouter une ordonnance" onPress={() => router.push('/prescription')} />
      <View style={{ height: 16 }} />
      {mine.length === 0 ? (
        <Card>
          <Text style={s.meta}>Aucun fichier transmis pour le moment.</Text>
        </Card>
      ) : (
        mine.map((rx) => (
          <Card key={rx.id} style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <Text style={s.name}>{rx.fileName}</Text>
              <Badge text={rxStatusLabel[rx.status]} tone={rxStatusTone[rx.status]} />
            </View>
            <Text style={s.meta}>🏥 {rx.pharmacyName}</Text>
            <Text style={s.meta}>{new Date(rx.createdAt).toLocaleDateString('fr-GA')}</Text>
            {rx.products.length ? <Text style={s.meta}>{rx.products.join(', ')}</Text> : null}
            {rx.status === 'rejected' && rx.note ? <Text style={s.reject}>{rx.note}</Text> : null}
            <View style={{ marginTop: 12 }}>
              <Button title="Voir le fichier" kind="secondary" onPress={() => router.push({ pathname: '/rx/[id]', params: { id: rx.id } })} />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '800', color: colors.text, flex: 1 },
  meta: { color: colors.muted, marginTop: 6 },
  reject: { color: colors.danger, fontWeight: '700', marginTop: 8 },
});
