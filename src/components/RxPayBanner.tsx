import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card } from './UI';
import { colors } from '../theme';
import { useCartRx } from '../hooks/useCartRx';

export function RxPayBanner() {
  const { gate, latest } = useCartRx();
  if (gate === 'none') return null;
  if (gate === 'approved') {
    return (
      <Card style={s.ok}>
        <Text style={s.okTitle}>Ordonnance validée</Text>
        <Text style={s.meta}>La pharmacie a accepté le fichier. Vous pouvez payer.</Text>
      </Card>
    );
  }
  const pending = gate === 'pending';
  const rejected = gate === 'rejected';
  return (
    <Card style={s.rx}>
      <Text style={s.rxTitle}>
        {pending ? 'Ordonnance en cours de validation' : rejected ? 'Ordonnance refusée' : 'Ce produit nécessite une ordonnance.'}
      </Text>
      <Text style={s.meta}>
        {pending
          ? 'Le paiement s’ouvrira dès que la pharmacie aura validé le fichier.'
          : rejected
            ? latest?.note || 'Transmettez un fichier lisible (nom, date, prescription).'
            : 'Transmettez une photo ou un PDF. Le paiement reste bloqué jusqu’à validation.'}
      </Text>
      <View style={{ marginTop: 12 }}>
        {pending && latest ? (
          <Button title="Suivre l’ordonnance" kind="secondary" onPress={() => router.push({ pathname: '/rx/[id]', params: { id: latest.id } })} />
        ) : (
          <Button title={rejected ? 'Renvoyer mon ordonnance' : 'Ajouter mon ordonnance'} kind="secondary" onPress={() => router.push('/prescription')} />
        )}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  rx: { marginTop: 14, backgroundColor: '#FFF5F5', borderColor: '#FFC9C9' },
  rxTitle: { color: colors.danger, fontWeight: '900' },
  ok: { marginTop: 14, backgroundColor: colors.mint, borderColor: colors.mintBorder },
  okTitle: { color: colors.primaryDark, fontWeight: '900' },
  meta: { color: colors.muted, marginTop: 4, fontWeight: '700' },
});
