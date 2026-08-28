import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Card } from '../src/components/UI';
import { colors } from '../src/theme';
import { usePrescriptions } from '../src/store/prescriptions';

export default function Prescription() {
  const add = usePrescriptions((s) => s.add);
  const upload = () => {
    add({
      fileName: 'ordonnance.jpg',
      pharmacyName: 'Pharmacie du Centre',
      products: ['Ordonnance transmise'],
      status: 'sent',
    });
    Alert.alert('Ordonnance reçue', 'Le fichier est transmis à la pharmacie. Le paiement reste bloqué jusqu’à validation.', [
      { text: 'Continuer', onPress: () => router.back() },
    ]);
  };
  return (
    <View style={s.page}>
      <View style={s.icon}>
        <Ionicons name="document-lock-outline" size={54} color={colors.primary} />
      </View>
      <Text style={s.title}>Transmettre une ordonnance</Text>
      <Text style={s.text}>Prenez une photo nette ou choisissez un PDF. Vérifiez que le nom, la date et la prescription sont lisibles.</Text>
      <Card style={{ marginVertical: 24 }}>
        <Text style={s.rule}>• JPG, PNG ou PDF</Text>
        <Text style={s.rule}>• Fichier privé et sécurisé</Text>
        <Text style={s.rule}>• Validation par la pharmacie</Text>
        <Text style={s.rule}>• Aucun paiement avant approbation</Text>
      </Card>
      <Button title="Ajouter mon ordonnance" onPress={upload} />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 24, justifyContent: 'center' },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.mint,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 25, fontWeight: '900', color: colors.text, textAlign: 'center' },
  text: { color: colors.muted, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  rule: { color: colors.text, fontWeight: '700', marginVertical: 6 },
});
