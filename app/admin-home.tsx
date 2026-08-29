import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { usePharmacyCatalog } from '../src/store/catalog';
import { useOrders } from '../src/store/orders';
import { usePayouts } from '../src/store/payouts';
import { formatFcfa } from '../src/lib/payouts';
import { CourierAccount, PharmacyAccount } from '../src/types';

export default function AdminHome() {
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  const directory = useAuth((s) => s.directory);
  const catalog = usePharmacyCatalog((s) => s.items);
  const orders = useOrders((s) => s.orders);
  const payouts = usePayouts((s) => s.items);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;

  const pharmacies = directory.filter((a): a is PharmacyAccount => a.role === 'pharmacy');
  const couriers = directory.filter((a): a is CourierAccount => a.role === 'courier');
  const pendingPh = pharmacies.filter((p) => p.status === 'pending').length;
  const pendingCo = couriers.filter((c) => c.status === 'pending').length;
  const review = catalog.filter((i) => i.status === 'review').length;
  const pendingPay = payouts.filter((p) => p.status === 'pending').reduce((a, p) => a + p.amount, 0);

  const leave = () => {
    logout();
    router.replace('/admin' as Href);
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title={'Bonjour ' + session.firstName} />
      <Text style={s.meta}>Validez les officines, livreurs et médicaments à ordonnance avant publication.</Text>
      <View style={s.grid}>
        <Card style={s.stat}>
          <Text style={s.num}>{pendingPh}</Text>
          <Text style={s.label}>Pharmacies en attente</Text>
          <Badge text={pharmacies.length + ' au total'} tone="gray" />
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{pendingCo}</Text>
          <Text style={s.label}>Livreurs en attente</Text>
          <Badge text={couriers.length + ' au total'} tone="gray" />
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{review}</Text>
          <Text style={s.label}>Produits en contrôle</Text>
        </Card>
        <Card style={s.stat}>
          <Text style={s.num}>{formatFcfa(pendingPay)}</Text>
          <Text style={s.label}>Virements à envoyer</Text>
        </Card>
      </View>
      <Card style={{ marginTop: 14 }}>
        <Text style={s.label}>Activité</Text>
        <Text style={s.meta}>{orders.length} commande(s) · {catalog.length} produit(s) catalogue</Text>
        <View style={{ marginTop: 14 }}>
          <Button title="Traiter les dossiers pharmacies" onPress={() => router.push('/admin-pharmacies')} />
        </View>
      </Card>
      <View style={{ marginTop: 22 }}>
        <Button title="Se déconnecter" kind="secondary" onPress={leave} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 50 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  stat: { width: '48%', flexGrow: 1 },
  num: { fontSize: 22, fontWeight: '900', color: colors.text },
  label: { fontWeight: '800', color: colors.text, marginTop: 6, marginBottom: 8 },
});
