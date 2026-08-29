import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, pharmacyTabs, useTabScreenPad } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePrescriptions, rxStatusLabel, rxStatusTone } from '../src/store/prescriptions';

export default function PharmacyPrescriptions() {
  const session = useAuth((s) => s.session);
  const items = usePrescriptions((s) => s.items);
  const tabPad = useTabScreenPad();
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;

  const mine = items.filter((r) => r.pharmacyAccountId === session.id);
  const pending = mine.filter((r) => r.status === 'sent' || r.status === 'review');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[s.page, { paddingBottom: tabPad }]}>
        <Text style={s.title}>Ordonnances</Text>
        <Text style={s.meta}>
          {pending.length
            ? pending.length + ' fichier(s) à valider avant d’ouvrir le paiement client.'
            : 'Aucun fichier en attente. Les nouvelles ordonnances arrivent ici.'}
        </Text>
        {mine.length === 0 ? (
          <Card style={{ marginTop: 12 }}>
            <Text style={s.meta}>Les clients transmettent photo ou PDF depuis le panier.</Text>
          </Card>
        ) : (
          mine.map((rx) => (
            <Card key={rx.id} style={{ marginTop: 12 }}>
              <View style={s.row}>
                <Text style={s.name}>{rx.fileName}</Text>
                <Badge text={rxStatusLabel[rx.status]} tone={rxStatusTone[rx.status]} />
              </View>
              <Text style={s.meta}>👤 {rx.clientName}</Text>
              {rx.products.length ? <Text style={s.meta}>{rx.products.join(', ')}</Text> : null}
              <Text style={s.meta}>{new Date(rx.createdAt).toLocaleDateString('fr-GA')}</Text>
              <View style={{ marginTop: 12 }}>
                <Button
                  title={rx.status === 'sent' || rx.status === 'review' ? 'Examiner' : 'Voir'}
                  onPress={() => router.push({ pathname: '/rx/[id]', params: { id: rx.id } })}
                />
              </View>
            </Card>
          ))
        )}
        <View style={{ marginTop: 16 }}>
          <Button title="Voir les commandes" kind="secondary" onPress={() => router.push('/pharmacy-orders')} />
        </View>
      </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontWeight: '800', color: colors.text, flex: 1 },
});
