import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../src/components/UI';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { useCart } from '../src/store/cart';
import { usePrescriptions } from '../src/store/prescriptions';
import { pharmacies } from '../src/data/mock';
import { pharmacyAccountIdFor } from '../src/lib/payouts';
import { cartRxContext } from '../src/lib/rxGate';
import { pickRxDocument, pickRxFromLibrary, takeRxPhoto, type PickedRx } from '../src/lib/pickPrescription';

export default function Prescription() {
  const session = useAuth((s) => s.session);
  const cart = useCart((s) => s.items);
  const add = usePrescriptions((s) => s.add);
  const ctx = useMemo(() => cartRxContext(cart), [cart]);
  const [picked, setPicked] = useState<PickedRx | null>(null);
  const [pharmacyId, setPharmacyId] = useState(ctx?.pharmacyId || pharmacies[0].id);
  const locked = !!ctx;
  const pharmacy = ctx
    ? { id: ctx.pharmacyId, name: ctx.pharmacyName, accountId: ctx.pharmacyAccountId }
    : (() => {
        const p = pharmacies.find((x) => x.id === pharmacyId) || pharmacies[0];
        return { id: p.id, name: p.name, accountId: pharmacyAccountIdFor(p) };
      })();

  const setFile = async (fn: () => Promise<PickedRx | null>) => {
    const file = await fn();
    if (file) setPicked(file);
  };

  const send = () => {
    if (!session || session.role !== 'client') {
      Alert.alert('Connexion requise', 'Connectez-vous pour transmettre l’ordonnance à la pharmacie.', [
        { text: 'Annuler' },
        { text: 'Connexion', onPress: () => router.push('/auth') },
      ]);
      return;
    }
    if (!picked) {
      Alert.alert('Fichier manquant', 'Prenez une photo nette ou choisissez un PDF.');
      return;
    }
    add({
      clientId: session.id,
      clientName: session.firstName + ' ' + session.lastName,
      pharmacyId: pharmacy.id,
      pharmacyAccountId: pharmacy.accountId,
      pharmacyName: pharmacy.name,
      fileName: picked.fileName,
      fileUri: picked.uri,
      kind: picked.kind,
      products: ctx?.products || [],
      productIds: ctx?.productIds || [],
    });
    Alert.alert(
      'Ordonnance transmise',
      'Le fichier est envoyé à ' + pharmacy.name + '. Le paiement reste bloqué jusqu’à validation.',
      [{ text: 'OK', onPress: () => router.replace('/prescriptions') }],
    );
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.icon}>
        <Ionicons name="document-lock-outline" size={46} color={colors.primary} />
      </View>
      <Text style={s.title}>Transmettre une ordonnance</Text>
      <Text style={s.text}>
        Photo ou PDF lisible (nom, date, prescription). Le fichier reste privé et n’est vu que par la pharmacie.
      </Text>

      <Card style={{ marginTop: 20 }}>
        <Text style={s.label}>Pharmacie</Text>
        {locked ? (
          <Text style={s.value}>{pharmacy.name}</Text>
        ) : (
          <View style={s.chips}>
            {pharmacies.map((p) => (
              <Pressable key={p.id} onPress={() => setPharmacyId(p.id)} style={[s.chip, pharmacyId === p.id && s.chipOn]}>
                <Text style={[s.chipText, pharmacyId === p.id && s.chipTextOn]}>{p.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {ctx?.products.length ? (
          <Text style={s.meta}>Produits : {ctx.products.join(', ')}</Text>
        ) : (
          <Text style={s.meta}>Ajoutez un médicament sur ordonnance au panier pour lier les produits.</Text>
        )}
      </Card>

      <Card style={{ marginTop: 12 }}>
        {picked?.kind === 'image' ? <Image source={{ uri: picked.uri }} style={s.preview} /> : null}
        {picked?.kind === 'pdf' ? (
          <View style={s.pdf}>
            <Ionicons name="document-text" size={28} color={colors.primary} />
            <Text style={s.value}>{picked.fileName}</Text>
          </View>
        ) : null}
        {!picked ? <Text style={s.meta}>Aucun fichier sélectionné.</Text> : null}
        <View style={s.actions}>
          <Pressable onPress={() => setFile(takeRxPhoto)} style={s.action}>
            <Ionicons name="camera" size={20} color={colors.primary} />
            <Text style={s.actionText}>Photo</Text>
          </Pressable>
          <Pressable onPress={() => setFile(pickRxFromLibrary)} style={s.action}>
            <Ionicons name="images" size={20} color={colors.primary} />
            <Text style={s.actionText}>Galerie</Text>
          </Pressable>
          <Pressable onPress={() => setFile(pickRxDocument)} style={s.action}>
            <Ionicons name="document-attach" size={20} color={colors.primary} />
            <Text style={s.actionText}>PDF</Text>
          </Pressable>
        </View>
      </Card>

      <View style={{ marginTop: 20 }}>
        <Button title="Transmettre à la pharmacie" onPress={send} disabled={!picked} />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 24, paddingBottom: 48 },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.mint,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 25, fontWeight: '900', color: colors.text, textAlign: 'center' },
  text: { color: colors.muted, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  label: { fontWeight: '800', color: colors.text, fontSize: 13 },
  value: { fontWeight: '800', color: colors.text, marginTop: 6 },
  meta: { color: colors.muted, marginTop: 8, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  chipOn: { borderColor: colors.primary, backgroundColor: colors.mint },
  chipText: { fontWeight: '800', color: colors.muted, fontSize: 12 },
  chipTextOn: { color: colors.primary },
  preview: { width: '100%', height: 220, borderRadius: 14, backgroundColor: colors.mint, marginBottom: 12 },
  pdf: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
  },
  actionText: { fontWeight: '800', color: colors.primary, fontSize: 12 },
});
