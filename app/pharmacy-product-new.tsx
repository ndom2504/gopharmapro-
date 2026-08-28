import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import type { Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/UI';
import { ChoiceChips, Field, ToggleRow } from '../src/components/Field';
import { colors } from '../src/theme';
import { useAuth } from '../src/store/auth';
import { catalogCategories, usePharmacyCatalog } from '../src/store/catalog';
import { pickProductImages, takeProductPhoto } from '../src/lib/productImages';

const forms = ['Comprimés', 'Gélules', 'Sirop', 'Crème', 'Boîte', 'Autre'];

export default function NewPharmacyProduct() {
  const session = useAuth((s) => s.session);
  const addItem = usePharmacyCatalog((s) => s.addItem);
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState('Comprimés');
  const [category, setCategory] = useState(catalogCategories[0]);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [requiresPrescription, setRequiresPrescription] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [error, setError] = useState('');

  if (!session || session.role !== 'pharmacy') return <Redirect href={'/auth' as Href} />;
  if (session.status !== 'verified') return <Redirect href="/pharmacy-home" />;

  const submit = () => {
    const parsedPrice = Number(price.replace(/\s/g, '').replace(',', '.'));
    const parsedStock = Number(stock.replace(/\s/g, ''));
    if (name.trim().length < 2) return setError('Indiquez le nom du produit.');
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) return setError('Prix invalide.');
    if (!Number.isFinite(parsedStock) || parsedStock < 0) return setError('Stock invalide.');
    addItem({
      pharmacyId: session.id,
      pharmacyName: session.pharmacyName,
      name: name.trim(),
      genericName: genericName.trim() || name.trim(),
      dosage: dosage.trim() || '—',
      form,
      category,
      description: description.trim(),
      requiresPrescription,
      price: Math.round(parsedPrice),
      stock: Math.round(parsedStock),
      imageUris,
    });
    router.replace('/pharmacy-catalog');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>Ajouter un produit</Text>
        <Text style={s.meta}>Ajoutez jusqu’à 5 photos (boîte, blister, notice). Elles s’affichent sur la fiche client.</Text>
        <Text style={s.label}>Photos du produit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.photos}>
          {imageUris.map((uri) => (
            <View key={uri} style={s.photoWrap}>
              <Image source={{ uri }} style={s.photo} />
              <Pressable onPress={() => setImageUris((list) => list.filter((x) => x !== uri))} style={s.remove}>
                <Ionicons name="close" size={14} color="#fff" />
              </Pressable>
            </View>
          ))}
          {imageUris.length < 5 ? (
            <Pressable
              onPress={() =>
                Alert.alert('Ajouter une photo', 'Choisissez la source', [
                  { text: 'Galerie', onPress: () => pickProductImages(imageUris).then(setImageUris) },
                  { text: 'Appareil photo', onPress: () => takeProductPhoto(imageUris).then(setImageUris) },
                  { text: 'Annuler', style: 'cancel' },
                ])
              }
              style={s.addPhoto}
            >
              <Ionicons name="camera" size={22} color={colors.primary} />
              <Text style={s.addPhotoText}>Ajouter</Text>
            </Pressable>
          ) : null}
        </ScrollView>
        <Field label="Nom commercial" value={name} onChange={setName} placeholder="Paracétamol 500 mg" autoCapitalize="sentences" />
        <Field label="DCI / nom générique" value={genericName} onChange={setGenericName} placeholder="Paracétamol" />
        <Field label="Dosage" value={dosage} onChange={setDosage} placeholder="500 mg" />
        <Text style={s.label}>Forme</Text>
        <ChoiceChips options={forms.map((f) => ({ id: f, label: f }))} value={form} onChange={setForm} />
        <Text style={s.label}>Catégorie</Text>
        <ChoiceChips options={catalogCategories.map((c) => ({ id: c, label: c }))} value={category} onChange={setCategory} />
        <Field label="Prix (FCFA)" value={price} onChange={setPrice} placeholder="3500" keyboardType="number-pad" />
        <Field label="Stock" value={stock} onChange={setStock} placeholder="20" keyboardType="number-pad" />
        <ToggleRow
          label="Ordonnance obligatoire"
          hint="Si oui, le produit suit le contrôle pharmacie avant publication."
          value={requiresPrescription}
          onChange={setRequiresPrescription}
        />
        <Field label="Description (optionnel)" value={description} onChange={setDescription} placeholder="Conseils, posologie…" />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <Button title="Enregistrer le produit" onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '900', color: colors.text },
  meta: { color: colors.muted, marginTop: 6, marginBottom: 16, lineHeight: 20 },
  label: { fontWeight: '800', color: colors.text, marginBottom: 8 },
  photos: { gap: 10, marginBottom: 18, alignItems: 'center' },
  photoWrap: { position: 'relative' },
  photo: { width: 92, height: 92, borderRadius: 16, backgroundColor: colors.mint },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 92,
    height: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoText: { fontWeight: '800', color: colors.primary, fontSize: 12 },
  error: { color: colors.danger, fontWeight: '700', marginBottom: 12 },
});
