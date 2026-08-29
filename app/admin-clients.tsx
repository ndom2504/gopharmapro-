import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { Card } from '../src/components/UI';
import { AdminBar } from '../src/components/AdminBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { ClientAccount } from '../src/types';

export default function AdminClients() {
  const session = useAuth((s) => s.session);
  const directory = useAuth((s) => s.directory);
  if (!session || session.role !== 'admin') return <Redirect href={'/admin' as Href} />;
  const clients = directory.filter((a): a is ClientAccount => a.role === 'client');

  return (
    <ScrollView contentContainerStyle={s.page}>
      <AdminBar title="Clients" />
      {clients.map((c) => (
        <Card key={c.id} style={{ marginTop: 12 }}>
          <Text style={s.name}>
            {c.firstName} {c.lastName}
          </Text>
          <Text style={s.meta}>{c.phone}</Text>
          <Text style={s.meta}>{c.email}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 40 },
  name: { fontWeight: '800', color: colors.text, fontSize: 16 },
  meta: { color: colors.muted, marginTop: 4 },
});
