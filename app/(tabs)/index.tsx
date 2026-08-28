import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../../src/data/mock';
import { Badge, Card, SearchBox } from '../../src/components/UI';
import { LocationBar } from '../../src/components/LocationBar';
import { colors } from '../../src/theme';
import { useGeoCatalog } from '../../src/hooks/useGeoCatalog';
import { formatKm } from '../../src/lib/geo';

const categoryIcons = ['medical', 'sparkles', 'happy', 'bandage', 'nutrition', 'heart'] as const;

export default function Home() {
  const [q, setQ] = useState('');
  const { nearbyPharmacies, locatedProducts, status, address, outsideGabon, refresh } = useGeoCatalog();
  const go = () => router.push({ pathname: '/(tabs)/search', params: { q } });
  return (
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.hero}>
        <View>
          <Text style={s.hello}>Bonjour 👋</Text>
          <Text style={s.title}>Que recherchez-vous ?</Text>
        </View>
        <Pressable style={s.bell}>
          <Ionicons name="notifications-outline" size={23} color={colors.primary} />
        </Pressable>
      </View>
      <LocationBar status={status} address={address} outsideGabon={outsideGabon} onPress={refresh} />
      <View>
        <SearchBox value={q} onChange={setQ} />
        <Pressable onPress={go} style={s.searchButton}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Rechercher</Text>
        </Pressable>
      </View>
      <Text style={s.section}>Catégories</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(x) => x}
        contentContainerStyle={s.categoryList}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/search', params: { q: item } })}
            style={s.category}
          >
            <Ionicons name={categoryIcons[index] as any} size={23} color={colors.primary} />
            <Text style={s.catText}>{item}</Text>
          </Pressable>
        )}
      />
      <View style={s.row}>
        <Text style={s.section}>Pharmacies près de vous</Text>
        <Text onPress={() => router.push('/(tabs)/pharmacies')} style={s.link}>
          Voir tout
        </Text>
      </View>
      {nearbyPharmacies.slice(0, 2).map((p) => (
        <Pressable key={p.id} onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: p.id } })}>
          <Card style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <Text style={s.cardTitle}>{p.name}</Text>
              <Badge text={p.open ? 'Ouverte' : 'Fermée'} tone={p.open ? 'green' : 'red'} />
            </View>
            <Text style={s.meta}>
              ★ {p.rating}  ·  {formatKm(p.distance)}  ·  {p.eta}
            </Text>
            <Text style={s.meta}>{p.area}</Text>
            <Text style={s.meta}>{p.delivery ? 'Livraison disponible' : 'Retrait uniquement'}</Text>
          </Card>
        </Pressable>
      ))}
      <Text style={s.section}>Produits disponibles</Text>
      {locatedProducts.slice(0, 3).map((p) => (
        <Pressable key={p.id} onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}>
          <Card style={{ marginBottom: 12 }}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{p.name}</Text>
                <Text style={s.meta}>
                  {p.form} · dès {Math.min(...p.offers.map((o) => o.price)).toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
              {p.requiresPrescription ? <Badge text="Ordonnance" tone="red" /> : <Badge text="Disponible" />}
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { padding: 20, paddingTop: 58, paddingBottom: 110 },
  hero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  hello: { fontSize: 15, color: colors.muted },
  title: { fontSize: 27, fontWeight: '800', color: colors.text, marginTop: 4 },
  bell: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  searchButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: 25, marginBottom: 13 },
  categoryList: { alignItems: 'stretch', paddingRight: 4 },
  category: {
    minWidth: 110,
    minHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 17,
    marginRight: 11,
    paddingVertical: 13,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 0,
    alignSelf: 'stretch',
    overflow: 'visible',
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 16,
    flexShrink: 0,
    wordBreak: 'keep-all',
    overflowWrap: 'normal',
  } as any,
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  link: { color: colors.primary, fontWeight: '700', marginTop: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.muted, marginTop: 7 },
});
