import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, courierTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';

const vehicleLabel = { moto: 'Moto', voiture: 'Voiture', other: 'Autre' } as const;

export default function CourierProfile() {
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  if (!session || session.role !== 'courier') return <Redirect href={'/auth' as Href} />;
  const leave = () => {
    logout();
    router.replace('/auth' as Href);
  };
  const required = session.documents.filter((d) => d.required);
  const verified = required.filter((d) => d.status === 'verified').length;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.title}>Profil livreur</Text>
        <Card style={{ marginTop: 16 }}>
          <View style={s.avatar}>
            <Text style={s.initials}>
              {session.firstName[0]}
              {session.lastName[0] || ''}
            </Text>
          </View>
          <Text style={s.name}>
            {session.firstName} {session.lastName}
          </Text>
          <Badge
            text={session.status === 'active' ? 'Compte actif' : session.status === 'suspended' ? 'Suspendu' : 'Vérification'}
            tone={session.status === 'active' ? 'green' : session.status === 'suspended' ? 'red' : 'orange'}
          />
          <Text style={s.meta}>{session.phone}</Text>
          <Text style={s.meta}>{session.email}</Text>
          <Text style={s.meta}>Zone : {session.city} ({session.province})</Text>
          <Text style={s.meta}>Véhicule : {vehicleLabel[session.vehicle] || session.vehicle} · {session.plate || '—'}</Text>
          <Text style={s.meta}>Paiement : {session.payoutPhone || session.phone}</Text>
          <Text style={s.meta}>
            Documents : {verified}/{required.length} vérifiés
          </Text>
          {session.provider === 'google' || session.googleId ? <Text style={s.meta}>Connecté avec Google</Text> : null}
        </Card>
        <View style={{ marginTop: 18 }}>
          <Button title="Déconnexion" kind="secondary" onPress={leave} />
        </View>
      </ScrollView>
      <RoleTabBar items={courierTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  initials: { fontWeight: '900', fontSize: 22, color: colors.primary },
  name: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
});
