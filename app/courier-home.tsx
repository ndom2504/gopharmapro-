import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { NotificationBell } from '../src/components/NotificationBell';
import { RoleTabBar, courierTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { totalsFor, usePayouts } from '../src/store/payouts';
import { useOrders } from '../src/store/orders';
import { useCourierPrefs } from '../src/store/courierPrefs';
import { formatFcfa } from '../src/lib/payouts';
import { isDelivery } from '../src/lib/orderStatus';

export default function CourierHome() {
  const session = useAuth((s) => s.session);
  const payouts = usePayouts((s) => s.items);
  const orders = useOrders((s) => s.orders);
  const acceptRun = useOrders((s) => s.acceptRun);
  const available = useCourierPrefs((s) => s.available);
  const setAvailable = useCourierPrefs((s) => s.setAvailable);
  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;

  const money = totalsFor(
    payouts.filter((p) => p.beneficiary === 'courier'),
    session.id,
  );
  const mine = orders.filter((o) => o.courierId === session.id && isDelivery(o));
  const done = mine.filter((o) => o.status === 'delivered');
  const open = orders.filter((o) => isDelivery(o) && !o.courierId && o.status !== 'delivered');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <View style={s.top}>
          <View style={{ flex: 1 }}>
            <Text style={s.kicker}>Espace livreur</Text>
            <Text style={s.title}>Bonjour {session.firstName} 👋</Text>
          </View>
          <NotificationBell />
        </View>
        <Card style={{ marginTop: 14 }}>
          <View style={s.row}>
            <Text style={s.label}>Statut</Text>
            <Badge text={available ? 'Disponible' : 'Indisponible'} tone={available ? 'green' : 'gray'} />
          </View>
          <View style={{ marginTop: 12 }}>
            <Button title={available ? 'Passer indisponible' : 'Passer disponible'} kind="secondary" onPress={() => setAvailable(!available)} />
          </View>
        </Card>
        <Text style={s.section}>Résumé du jour</Text>
        <View style={s.stats}>
          <Card style={s.stat}>
            <Text style={s.num}>{mine.length}</Text>
            <Text style={s.statLabel}>Livraisons</Text>
          </Card>
          <Card style={s.stat}>
            <Text style={s.num}>{formatFcfa(money.pending + money.sent)}</Text>
            <Text style={s.statLabel}>Revenus</Text>
          </Card>
          <Card style={s.stat}>
            <Text style={s.num}>{done.length}</Text>
            <Text style={s.statLabel}>Terminées</Text>
          </Card>
        </View>
        <Text style={s.section}>Nouvelles livraisons</Text>
        {!available ? (
          <Card>
            <Text style={s.meta}>Passez disponible pour recevoir des missions.</Text>
          </Card>
        ) : open.length === 0 ? (
          <Card>
            <Text style={s.meta}>Aucune nouvelle course pour le moment.</Text>
          </Card>
        ) : (
          open.map((o) => (
            <Card key={o.id} style={{ marginBottom: 12 }}>
              <Text style={s.name}>Livraison #{o.id}</Text>
              <Text style={s.meta}>🏥 {o.pharmacyName}</Text>
              <Text style={s.meta}>📍 1,4 km</Text>
              <Text style={s.arrow}>↓</Text>
              <Text style={s.meta}>👤 Client</Text>
              <Text style={s.meta}>📍 3,2 km · {o.deliveryAddress}</Text>
              <Text style={s.gain}>Gain livraison : {formatFcfa(o.split?.courierNet || o.fee)}</Text>
              <Text style={s.meta}>⏱️ Estimation : {o.eta}</Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                <Button title="Voir la livraison" kind="secondary" onPress={() => router.push({ pathname: '/courier-run/[id]', params: { id: o.id } })} />
                <Button
                  title="Accepter"
                  onPress={() => {
                    acceptRun(o.id, session.id);
                    router.push({ pathname: '/courier-run/[id]', params: { id: o.id } });
                  }}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
      <RoleTabBar items={courierTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 100 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: { color: colors.muted, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 22, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontWeight: '800', color: colors.text },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1 },
  num: { fontSize: 18, fontWeight: '900', color: colors.text },
  statLabel: { color: colors.muted, fontWeight: '700', marginTop: 4, fontSize: 12 },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4, lineHeight: 20 },
  arrow: { color: colors.muted, fontWeight: '800', marginVertical: 4 },
  gain: { color: colors.primary, fontWeight: '900', marginTop: 10 },
});
