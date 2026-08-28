import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';
import { useOrders } from '../src/store/orders';
import { usePayouts } from '../src/store/payouts';
import { formatFcfa } from '../src/lib/payouts';
import { CourierAccount, PharmacyAccount } from '../src/types';

export default function AdminStats() {
  const session = useAuth((s) => s.session);
  const directory = useAuth((s) => s.directory);
  const catalog = usePharmacyCatalog((s) => s.items);
  const orders = useOrders((s) => s.orders);
  const payouts = usePayouts((s) => s.items);
  if (!session || session.role !== 'admin') return <Redirect href={'/auth' as Href} />;
  const pharmacies = directory.filter((a): a is PharmacyAccount => a.role === 'pharmacy');
  const couriers = directory.filter((a): a is CourierAccount => a.role === 'courier');
  const gmv = orders.reduce((a, o) => a + o.total, 0);

  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Statistiques" />
      <View style={s.grid}>
        <Card style={s.stat}>
          <Text style={s.num}>{pharmacies.length}</Text>
          <Text style={s.label}>Pharmacies</Text>
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{couriers.length}</Text>
          <Text style={s.label}>Livreurs</Text>
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{orders.length}</Text>
          <Text style={s.label}>Commandes</Text>
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{catalog.length}</Text>
          <Text style={s.label}>Produits</Text>
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{formatFcfa(gmv)}</Text>
          <Text style={s.label}>Volume</Text>
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{formatFcfa(payouts.filter((p) => p.status === 'pending').reduce((a, p) => a + p.amount, 0))}</Text>
          <Text style={s.label}>Paiements à envoyer</Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  stat: { width: '48%', flexGrow: 1 },
  num: { fontSize: 20, fontWeight: '900', color: colors.text },
  label: { fontWeight: '800', color: colors.text, marginTop: 6 },
});
