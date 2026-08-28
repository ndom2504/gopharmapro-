import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { NotificationBell } from '../src/components/NotificationBell';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { totalsFor, usePayouts } from '../src/store/payouts';
import { useOrders } from '../src/store/orders';
import { formatFcfa } from '../src/lib/payouts';
import { orderStatusLabel, orderStatusTone } from '../src/lib/orderStatus';

const vehicleLabel = { moto: 'Moto', voiture: 'Voiture', other: 'Autre' } as const;

export default function CourierHome() {
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  const payouts = usePayouts((s) => s.items);
  const orders = useOrders((s) => s.orders);
  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;

  const leave = () => {
    logout();
    router.replace('/auth' as Href);
  };

  const money = totalsFor(
    payouts.filter((p) => p.beneficiary === 'courier'),
    session.id,
  );
  const runs = orders.filter((o) => o.courierId === session.id);

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.top}>
        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>Espace livreur</Text>
          <Text style={s.title}>
            {session.firstName} {session.lastName}
          </Text>
        </View>
        <NotificationBell />
      </View>
      <View style={{ marginTop: 10 }}>
        <Badge
          text={session.status === 'active' ? 'Compte actif' : session.status === 'suspended' ? 'Compte suspendu' : 'Vérification en cours'}
          tone={session.status === 'active' ? 'green' : session.status === 'suspended' ? 'red' : 'orange'}
        />
      </View>
      <Card style={{ marginTop: 18 }}>
        <Text style={s.label}>Gains</Text>
        <Text style={s.value}>{formatFcfa(money.pending)}</Text>
        <Text style={s.meta}>En attente de virement · {formatFcfa(money.sent)} déjà versés</Text>
        <View style={{ marginTop: 14 }}>
          <Button title="Voir les paiements" onPress={() => router.push('/courier-earnings')} />
        </View>
      </Card>
      <Card style={{ marginTop: 14 }}>
        <Text style={s.label}>Profil</Text>
        <Text style={s.value}>{session.phone || 'Téléphone à compléter'}</Text>
        <Text style={s.meta}>{session.email}</Text>
        <Text style={s.meta}>
          Véhicule : {vehicleLabel[session.vehicle]}
          {session.vehicle === 'other' && session.vehicleOther ? ' · ' + session.vehicleOther : ''}
          {session.plate ? ' · ' + session.plate : ''}
        </Text>
        {session.city ? (
          <Text style={s.meta}>
            Zone : {session.area ? session.area + ', ' : ''}
            {session.city} ({session.province})
          </Text>
        ) : null}
        {session.payoutPhone ? <Text style={s.meta}>Gains : {session.payoutPhone}</Text> : null}
        {session.provider === 'google' || session.googleId ? (
          <Text style={[s.meta, { marginTop: 8 }]}>Connecté avec Google</Text>
        ) : null}
        {session.documents?.length ? (
          <Text style={[s.meta, { marginTop: 8 }]}>
            {session.documents.filter((d) => d.status === 'verified').length}/{session.documents.filter((d) => d.required).length} documents vérifiés
          </Text>
        ) : null}
      </Card>
      {runs.length ? (
        runs.map((o) => (
          <Card key={o.id} style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={s.value}>#{o.id}</Text>
              <Badge text={orderStatusLabel(o)} tone={orderStatusTone(o.status)} />
            </View>
            <Text style={s.meta}>
              {o.pharmacyName} → {o.deliveryAddress}
            </Text>
            {o.status !== 'delivered' ? (
              <Text style={s.code}>Code ramassage {o.pickupCode}</Text>
            ) : null}
            <View style={{ marginTop: 12 }}>
              <Button title="Ouvrir la course" onPress={() => router.push({ pathname: '/courier-run/[id]', params: { id: o.id } })} />
            </View>
          </Card>
        ))
      ) : (
        <Card style={{ marginTop: 14, backgroundColor: '#FFF4E6', borderColor: '#FFD8A8' }}>
          <Text style={s.label}>Courses</Text>
          <Text style={s.meta}>
            Aucune course. Dès qu’un client paie une livraison, le code de ramassage apparaît ici.
          </Text>
        </Card>
      )}
      <View style={{ marginTop: 22 }}>
        <Button title="Se déconnecter" kind="secondary" onPress={leave} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 64, paddingBottom: 40 },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kicker: { color: colors.muted, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 4 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  value: { fontWeight: '800', color: colors.text, fontSize: 16, flex: 1 },
  meta: { color: colors.muted, marginTop: 4, lineHeight: 20 },
  code: { marginTop: 8, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
});
