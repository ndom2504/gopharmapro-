import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Button, Card } from '../src/components/UI';
import { RoleTabBar, courierTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { useOrders } from '../src/store/orders';
import { isDelivery } from '../src/lib/orderStatus';

export default function CourierMap() {
  const session = useAuth((s) => s.session);
  const orders = useOrders((s) => s.orders);
  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;
  const active = orders.find((o) => isDelivery(o) && o.courierId === session.id && o.status !== 'delivered');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.title}>Carte</Text>
        {!active ? (
          <Card>
            <Text style={s.meta}>Acceptez une livraison pour afficher l’itinéraire pharmacie → client.</Text>
          </Card>
        ) : (
          <Card>
            <Text style={s.node}>🏥 {active.pharmacyName}</Text>
            <Text style={s.arrow}>│</Text>
            <Text style={s.truck}>🚚 Vous</Text>
            <Text style={s.arrow}>│</Text>
            <Text style={s.node}>👤 Client</Text>
            <Text style={s.meta}>{active.deliveryAddress}</Text>
            <View style={{ marginTop: 16, gap: 10 }}>
              <Button
                title="Naviguer"
                onPress={() =>
                  Linking.openURL(
                    'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(active.deliveryAddress),
                  )
                }
              />
              <Button title="Ouvrir la course" kind="secondary" onPress={() => router.push({ pathname: '/courier-run/[id]', params: { id: active.id } })} />
            </View>
          </Card>
        )}
      </ScrollView>
      <RoleTabBar items={courierTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text, marginBottom: 16 },
  node: { fontWeight: '800', color: colors.text, fontSize: 16 },
  arrow: { color: colors.muted, marginVertical: 6, fontWeight: '800' },
  truck: { fontSize: 22, fontWeight: '800' },
  meta: { color: colors.muted, marginTop: 10, lineHeight: 20 },
});
