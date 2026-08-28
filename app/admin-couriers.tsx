import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { CourierAccount } from '../src/types';

export default function AdminCouriers() {
  const session = useAuth((s) => s.session);
  const directory = useAuth((s) => s.directory);
  const setCourierStatus = useAuth((s) => s.setCourierStatus);
  const setDocumentStatus = useAuth((s) => s.setDocumentStatus);
  if (!session || session.role !== 'admin') return <Redirect href={'/auth' as Href} />;
  const list = directory.filter((a): a is CourierAccount => a.role === 'courier');
  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Livreurs" />
      <Text style={s.meta}>Activez un livreur après contrôle CNI, permis et carte grise.</Text>
      {list.map((c) => (
        <Card key={c.id} style={{ marginTop: 12 }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {c.firstName} {c.lastName}
              </Text>
              <Text style={s.meta}>
                {c.vehicle} {c.plate ? '· ' + c.plate : ''} · {c.phone}
              </Text>
            </View>
            <Badge
              text={c.status === 'active' ? 'Actif' : c.status === 'suspended' ? 'Suspendu' : 'En attente'}
              tone={c.status === 'active' ? 'green' : c.status === 'suspended' ? 'red' : 'orange'}
            />
          </View>
          {(c.documents || []).filter((d) => d.fileName).map((d) => (
            <View key={d.key} style={s.doc}>
              <Text style={{ flex: 1, color: colors.text }}>
                {d.status === 'verified' ? '🟢' : d.status === 'rejected' ? '🔴' : '🟠'} {d.label}
              </Text>
              <Text onPress={() => setDocumentStatus(c.id, d.key, 'verified')} style={s.ok}>
                OK
              </Text>
            </View>
          ))}
          <View style={{ marginTop: 12, gap: 8 }}>
            <Button title="Activer" onPress={() => setCourierStatus(c.id, 'active')} />
            <Button title="Suspendre" kind="secondary" onPress={() => setCourierStatus(c.id, 'suspended')} />
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
  doc: { flexDirection: 'row', gap: 10, marginTop: 8, alignItems: 'center' },
  ok: { color: colors.primary, fontWeight: '800' },
});
