import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ScreenTitle } from '../../src/components/UI';
import { colors } from '../../src/theme';
import { paymentMethods } from '../../src/data/payments';
import { LocationBar } from '../../src/components/LocationBar';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { useAuth } from '../../src/store/auth';

const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; href?: Href }[] = [
  { icon: 'person-outline', label: 'Informations personnelles' },
  { icon: 'call-outline', label: 'Téléphone' },
  { icon: 'mail-outline', label: 'Email' },
  { icon: 'camera-outline', label: 'Photo' },
  { icon: 'location-outline', label: 'Mes adresses' },
  { icon: 'cube-outline', label: 'Mes commandes', href: '/(tabs)/orders' },
  { icon: 'document-text-outline', label: 'Mes ordonnances', href: '/prescriptions' },
  { icon: 'heart-outline', label: 'Mes favoris', href: '/favorites' },
  { icon: 'card-outline', label: 'Moyens de paiement' },
  { icon: 'notifications-outline', label: 'Notifications', href: '/notifications' },
  { icon: 'shield-checkmark-outline', label: 'Sécurité' },
  { icon: 'help-circle-outline', label: 'Aide & support' },
  { icon: 'document-outline', label: 'Conditions d’utilisation' },
];

export default function Profile() {
  const { status, address, outsideGabon, refresh } = useGeoCatalog();
  const session = useAuth((s) => s.session);
  const guest = useAuth((s) => s.guest);
  const logout = useAuth((s) => s.logout);
  const client = session?.role === 'client' ? session : null;
  const initials = client ? (client.firstName[0] + (client.lastName[0] || '')).toUpperCase() : 'IN';
  const leave = () => {
    logout();
    router.replace('/auth' as Href);
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <ScreenTitle title="Mon compte" subtitle="Gérez votre profil, vos adresses et vos ordonnances." />
      <Card style={{ marginBottom: 16 }}>
        <View style={s.avatar}>
          <Text style={{ fontSize: 24, fontWeight: '900', color: colors.primary }}>{initials}</Text>
        </View>
        <Text style={s.name}>{client ? client.firstName + ' ' + client.lastName : 'Invité'}</Text>
        <Text style={s.meta}>
          {client
            ? [client.phone, client.email].filter(Boolean).join(' · ') || 'Connecté avec Google'
            : 'Parcourez Go Pharma Pro sans compte.'}
        </Text>
        {!client ? (
          <View style={{ marginTop: 16, gap: 10 }}>
            <Button title="Se connecter" onPress={() => router.push({ pathname: '/auth/login', params: { role: 'client' } })} />
            <Button title="Créer un compte client" kind="secondary" onPress={() => router.push('/auth/register-client')} />
          </View>
        ) : null}
      </Card>
      <View style={{ marginBottom: 16 }}>
        <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
      </View>
      <Card style={{ marginBottom: 16 }}>
        <Text style={s.payTitle}>Moyens de paiement</Text>
        <Text style={s.meta}>MobiCash, Airtel Money, Moov Money et carte (Stripe).</Text>
        {paymentMethods.map((m) => (
          <View key={m.id} style={s.payRow}>
            <View style={[s.payDot, { backgroundColor: m.color }]} />
            <Text style={s.label}>{m.name}</Text>
            <Text style={s.ussd}>{m.ussd}</Text>
          </View>
        ))}
      </Card>
      <Card>
        {rows.map((row, i) => (
          <Pressable
            key={row.label}
            onPress={() => {
              if (row.href) router.push(row.href);
              else if (row.label === 'Aide & support') Linking.openURL('mailto:contact@gopharmapro.com');
              else Alert.alert(row.label, 'Disponible dans la version complète du compte.');
            }}
            style={[s.row, i < rows.length - 1 && s.border]}
          >
            <Ionicons name={row.icon} size={22} color={colors.primary} />
            <Text style={s.label}>{row.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Pressable>
        ))}
      </Card>
      {client || guest ? (
        <View style={{ marginTop: 18 }}>
          <Button title={client ? 'Déconnexion' : 'Quitter le mode invité'} kind="secondary" onPress={leave} />
        </View>
      ) : null}
      <Text style={s.notice}>Cette version est un prototype. Elle ne fournit pas de conseil médical.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  name: { fontSize: 18, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 5, lineHeight: 20 },
  payTitle: { fontWeight: '800', color: colors.text, fontSize: 16 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  payDot: { width: 10, height: 10, borderRadius: 5 },
  ussd: { color: colors.muted, fontWeight: '700' },
  row: { height: 58, flexDirection: 'row', alignItems: 'center', gap: 12 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { flex: 1, fontWeight: '700', color: colors.text },
  notice: { marginTop: 20, color: colors.muted, fontSize: 12, lineHeight: 18 },
});
