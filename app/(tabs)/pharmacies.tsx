import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Badge, Card, ScreenTitle } from '../../src/components/UI';
import { LocationBar } from '../../src/components/LocationBar';
import { PharmacyFeedback } from '../../src/components/PharmacyFeedback';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm } from '../../src/lib/geo';

export default function Pharmacies() {
  const { nearbyPharmacies, status, address, outsideGabon, refresh } = useGeoCatalog();
  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Pharmacies" subtitle="Établissements vérifiés autour de vous." />
      <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
      {nearbyPharmacies.map((p) => (
        <Card key={p.id} style={{ marginBottom: 13, marginTop: 10 }}>
          <Pressable onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: p.id } })}>
            <View style={s.row}>
              <Text style={s.name}>{p.name}</Text>
              <Badge text={p.open ? 'Ouverte' : 'Fermée'} tone={p.open ? 'green' : 'red'} />
            </View>
            <Text style={s.meta}>
              {formatKm(p.distance)} · {p.eta}
            </Text>
            <Text style={s.meta}>{p.area}</Text>
            <Text style={s.meta}>
              {p.pickup ? 'Retrait' : 'Aucun retrait'} · {p.delivery ? 'Livraison ' + p.fee.toLocaleString('fr-FR') + ' FCFA' : 'Pas de livraison'}
            </Text>
          </Pressable>
          <PharmacyFeedback pharmacyId={p.id} name={p.name} baseRating={p.rating} reviewCount={p.reviewCount} />
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 17, fontWeight: '800', color: colors.text, flex: 1 },
  meta: { fontSize: 14, color: colors.muted, marginTop: 8 },
});
