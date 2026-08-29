import { ScrollView, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { serviceZoneShort } from '../src/data/places';

export default function AdminConfig() {
  const session = useAuth((s) => s.session);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Configuration" />
      <Card style={{ marginTop: 12 }}>
        <Text style={s.label}>Zones</Text>
        <Text style={s.value}>{serviceZoneShort()}</Text>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Text style={s.label}>Code de confirmation</Text>
        <Text style={s.value}>6 chiffres (démo GP-10482 : 739204)</Text>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Text style={s.label}>Paiement ordonnance</Text>
        <Text style={s.value}>Bloqué jusqu’à validation par la pharmacie</Text>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Text style={s.label}>Encaissement</Text>
        <Text style={s.value}>Go Pharma Pro, puis virement officine / livreur</Text>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 40 },
  label: { fontWeight: '800', color: colors.text },
  value: { color: colors.muted, marginTop: 6, lineHeight: 20 },
});
