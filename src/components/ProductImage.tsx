import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { productPhoto } from '../lib/productPhotos';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Médicaments: 'medical',
  Hygiène: 'sparkles',
  Bébé: 'happy',
  'Premiers soins': 'bandage',
  Vitamines: 'nutrition',
  Parapharmacie: 'leaf',
};

type Size = 'thumb' | 'card' | 'hero';

const box: Record<Size, { w: number; h: number; r: number; icon: number }> = {
  thumb: { w: 88, h: 88, r: 16, icon: 26 },
  card: { w: 112, h: 112, r: 18, icon: 32 },
  hero: { w: 0, h: 280, r: 24, icon: 54 },
};

export function ProductImage({
  uris,
  imageKey,
  category,
  size = 'card',
}: {
  uris?: string[];
  imageKey?: string;
  category?: string;
  size?: Size;
}) {
  const uploaded = uris?.find(Boolean);
  const bundled = productPhoto(imageKey);
  const dim = box[size];
  const wrap =
    size === 'hero'
      ? { height: dim.h, width: '100%' as const, borderRadius: dim.r, marginBottom: 18 }
      : { width: dim.w, height: dim.h, borderRadius: dim.r };
  const frame = [s.frame, wrap];
  if (uploaded) {
    return (
      <View style={frame}>
        <Image source={{ uri: uploaded }} style={s.fill} resizeMode="cover" />
      </View>
    );
  }
  if (bundled) {
    return (
      <View style={frame}>
        <Image source={bundled} style={s.fill} resizeMode="cover" />
      </View>
    );
  }
  return (
    <View style={[s.ph, wrap]}>
      <Ionicons name={icons[category || ''] || 'medkit'} size={dim.icon} color={colors.primary} />
      {size === 'hero' ? <Text style={s.phText}>Photo du produit</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  frame: { backgroundColor: '#F3F7F4', overflow: 'hidden' },
  fill: { width: '100%', height: '100%' },
  ph: { backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  phText: { marginTop: 8, color: colors.primary, fontWeight: '800' },
});
