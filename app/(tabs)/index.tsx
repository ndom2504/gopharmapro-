import React, { useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { categories } from '../../src/data/mock';
import { Badge, Button, Card, SearchBox } from '../../src/components/UI';
import { NotificationBell } from '../../src/components/NotificationBell';
import { ProductImage } from '../../src/components/ProductImage';
import { LocationBar } from '../../src/components/LocationBar';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm } from '../../src/lib/geo';
import { categoryPhoto } from '../../src/lib/categoryPhotos';
import { categoryIcons } from '../../src/lib/dashboard';
import { useCart } from '../../src/store/cart';
import { useAuth } from '../../src/store/auth';
import { PharmacyFeedback } from '../../src/components/PharmacyFeedback';

export default function Home() {
  const [q, setQ] = useState('');
  const { nearbyPharmacies, locatedProducts, status, address, outsideGabon, refresh } = useGeoCatalog();
  const add = useCart((s) => s.add);
  const session = useAuth((s) => s.session);
  const hello = session?.role === 'client' ? `Bonjour ${session.firstName} 👋` : 'Bonjour 👋';
  const go = () => router.push({ pathname: '/(tabs)/search', params: { q } });

  const onAdd = (product: (typeof locatedProducts)[0]) => {
    const offer = product.offers.find((o) => o.stock > 0);
    if (!offer) return;
    const r = add(product, offer);
    if (r === 'different-pharmacy') {
      Alert.alert('Panier lié à une autre pharmacie', 'Videz le panier pour commander ici.');
      return;
    }
    router.push('/(tabs)/cart');
  };

  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.hero}>
        <View style={{ flex: 1 }}>
          <Text style={s.hello}>{hello}</Text>
          <Text style={s.title}>Que recherchez-vous aujourd’hui ?</Text>
        </View>
        <NotificationBell />
      </View>
      <SearchBox value={q} onChange={setQ} />
      <Pressable onPress={go} style={s.searchButton}>
        <Text style={{ color: colors.onPrimary, fontWeight: '800' }}>Rechercher</Text>
      </Pressable>
      <View style={{ marginTop: 14 }}>
        <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
      </View>
      <Text style={s.section}>Catégories</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[...categories, 'Pharmacies proches']}
        keyExtractor={(x) => x}
        contentContainerStyle={s.categoryList}
        renderItem={({ item }) => {
          if (item === 'Pharmacies proches') {
            return (
              <Pressable onPress={() => router.push('/(tabs)/pharmacies')} style={s.category}>
                <View style={[s.catImgWrap, s.catEmoji]}>
                  <Text style={{ fontSize: 36 }}>🏥</Text>
                </View>
                <Text style={s.catText}>Pharmacies proches</Text>
              </Pressable>
            );
          }
          const photo = categoryPhoto(item);
          return (
            <Pressable onPress={() => router.push({ pathname: '/(tabs)/search', params: { q: item } })} style={s.category}>
              {photo ? (
                <View style={s.catImgWrap}>
                  <Image source={photo} style={s.catImg} resizeMode="cover" />
                </View>
              ) : (
                <View style={[s.catImgWrap, s.catEmoji]}>
                  <Text style={{ fontSize: 36 }}>{categoryIcons[item] || '💊'}</Text>
                </View>
              )}
              <Text style={s.catText}>{item}</Text>
            </Pressable>
          );
        }}
      />
      <View style={s.row}>
        <Text style={s.section}>Pharmacies proches</Text>
        <Text onPress={() => router.push('/(tabs)/pharmacies')} style={s.link}>
          Voir tout
        </Text>
      </View>
      {nearbyPharmacies.slice(0, 2).map((p) => (
        <Card key={p.id} style={{ marginBottom: 12 }}>
          <Text style={s.cardTitle}>{p.name}</Text>
          <Text style={s.meta}>📍 {formatKm(p.distance)} · {p.area}</Text>
          <View style={[s.row, { marginTop: 8 }]}>
            <Badge text={p.open ? 'Ouverte' : 'Fermée'} tone={p.open ? 'green' : 'red'} />
            {p.delivery ? <Badge text="Livraison disponible" tone="gray" /> : <Badge text="Retrait uniquement" tone="gray" />}
          </View>
          <PharmacyFeedback pharmacyId={p.id} name={p.name} baseRating={p.rating} reviewCount={p.reviewCount} />
          <View style={{ marginTop: 12 }}>
            <Button title="Voir pharmacie" onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: p.id } })} />
          </View>
        </Card>
      ))}
      <Text style={s.section}>Produits disponibles près de vous</Text>
      {locatedProducts.slice(0, 4).map((p) => {
        const offer = [...p.offers].filter((o) => o.stock > 0).sort((a, b) => a.pharmacy.distance - b.pharmacy.distance)[0] || p.offers[0];
        return (
          <Card key={p.id} style={{ marginBottom: 12 }}>
            <Pressable onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })} style={s.row}>
              <ProductImage uris={p.imageUris} imageKey={p.imageKey || p.id} category={p.category} size="thumb" />
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{p.name}</Text>
                <Text style={s.price}>{offer.price.toLocaleString('fr-FR')} FCFA</Text>
                <Text style={s.meta}>{offer.pharmacy.name} · {formatKm(offer.pharmacy.distance)}</Text>
              </View>
            </Pressable>
            <View style={{ marginTop: 12, gap: 8 }}>
              <Button title="Voir pharmacie" onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: offer.pharmacy.id } })} />
              <Button title="Ajouter" kind="ink" onPress={() => onAdd(p)} disabled={!offer?.stock} />
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  hello: { fontSize: 15, color: colors.muted, fontWeight: '700' },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4 },
  searchButton: {
    marginTop: 10,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: 25, marginBottom: 13 },
  categoryList: { alignItems: 'stretch', paddingRight: 4 },
  category: {
    width: 148,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginRight: 11,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    flexShrink: 0,
  },
  catImgWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#F3F7F4', padding: 0 },
  catEmoji: { alignItems: 'center', justifyContent: 'center' },
  catImg: { width: '100%', height: '100%' },
  catText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 15,
    textAlign: 'center',
    backgroundColor: colors.mint,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  link: { color: colors.text, fontWeight: '700', marginTop: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
  meta: { fontSize: 13, color: colors.muted, marginTop: 5 },
  price: { fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 4 },
});
