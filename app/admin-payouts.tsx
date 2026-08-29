import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePayouts } from '../src/store/payouts';
import { formatFcfa } from '../src/lib/payouts';

export default function AdminPayouts() {
  const session = useAuth((s) => s.session);
  const items = usePayouts((s) => s.items);
  const markSent = usePayouts((s) => s.markSent);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Virements" />
      <Text style={s.meta}>Marquez comme envoyé après le transfert mobile money vers l’officine ou le livreur.</Text>
      {items.length === 0 ? <Text style={s.meta}>Aucun virement pour le moment.</Text> : null}
      {items.map((p) => (
        <Card key={p.id} style={{ marginTop: 12 }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{formatFcfa(p.amount)}</Text>
              <Text style={s.meta}>
                {p.beneficiary === 'pharmacy' ? 'Pharmacie' : 'Livreur'} · {p.phone}
              </Text>
              <Text style={s.meta}>Commande {p.orderId}</Text>
            </View>
            <Badge text={p.status === 'sent' ? 'Envoyé' : 'À virer'} tone={p.status === 'sent' ? 'green' : 'orange'} />
          </View>
          {p.status === 'pending' ? (
            <View style={{ marginTop: 12 }}>
              <Button title="Marquer comme viré" onPress={() => markSent(p.id)} />
            </View>
          ) : null}
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { fontWeight: '900', color: colors.text, fontSize: 18 },
});
