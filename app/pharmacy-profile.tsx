import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Badge, Button, Card } from '../src/components/UI';
import { RoleTabBar, pharmacyTabs } from '../src/components/RoleTabBar';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { startPharmacyIdentity } from '../src/lib/stripePay';

export default function PharmacyProfile() {
  const session = useAuth((s) => s.session);
  const logout = useAuth((s) => s.logout);
  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;
  const leave = () => {
    logout();
    router.replace('/auth' as Href);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.page}>
        <Text style={s.title}>Profil officine</Text>
        <Card style={{ marginTop: 16 }}>
          <Text style={s.name}>{session.pharmacyName}</Text>
          <Badge
            text={session.status === 'verified' ? 'Vérifiée' : session.status === 'rejected' ? 'Rejetée' : 'En attente'}
            tone={session.status === 'verified' ? 'green' : session.status === 'rejected' ? 'red' : 'orange'}
          />
          <Text style={s.meta}>{session.pharmacistName}</Text>
          <Text style={s.meta}>{session.phone}</Text>
          <Text style={s.meta}>{session.email}</Text>
          <Text style={s.meta}>
            {session.address}, {session.area}, {session.city}
          </Text>
        </Card>
        <Card style={{ marginTop: 16 }}>
          <Text style={s.name}>Identité Stripe</Text>
          <Text style={s.meta}>
            Le pharmacien responsable confirme sa pièce d’identité et un selfie via Stripe Identity.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button
              title="Vérifier mon identité"
              onPress={async () => {
                const result = await startPharmacyIdentity({
                  email: session.email,
                  pharmacyId: session.id,
                  pharmacyName: session.pharmacyName,
                });
                if (!result.demo) {
                  await WebBrowser.openBrowserAsync(result.url);
                  return;
                }
                Alert.alert(
                  'Mode démo',
                  'Ajoutez STRIPE_SECRET_KEY sur le site pour lancer le vrai contrôle Stripe Identity.',
                );
              }}
            />
          </View>
        </Card>
        <View style={{ marginTop: 18 }}>
          <Button title="Déconnexion" kind="secondary" onPress={leave} />
        </View>
      </ScrollView>
      <RoleTabBar items={pharmacyTabs} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 100 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  name: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 8 },
  meta: { color: colors.muted, marginTop: 6, lineHeight: 20 },
});
