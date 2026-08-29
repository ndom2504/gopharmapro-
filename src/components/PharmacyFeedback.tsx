import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { useFavorites } from '../store/favorites';
import { useReviews } from '../store/reviews';
import { formatRating, mergeRating } from '../lib/pharmacyRating';

function StarRow({
  value,
  onPick,
  size = 20,
}: {
  value: number;
  onPick?: (stars: number) => void;
  size?: number;
}) {
  return (
    <View style={s.stars}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        return (
          <Pressable
            key={n}
            disabled={!onPick}
            hitSlop={6}
            onPress={() => onPick?.(n)}
            style={({ pressed }) => [s.starHit, pressed && { opacity: 0.55, transform: [{ scale: 0.88 }] }]}
          >
            <Ionicons name={on ? 'star' : 'star-outline'} size={size} color={on ? colors.warning : colors.border} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function PharmacyFeedback({
  pharmacyId,
  name,
  baseRating,
  reviewCount = 12,
}: {
  pharmacyId: string;
  name: string;
  baseRating: number;
  reviewCount?: number;
}) {
  const liked = useFavorites((s) => s.isPharmacy(pharmacyId));
  const toggleLike = useFavorites((s) => s.togglePharmacy);
  const mine = useReviews((s) => s.byPharmacy[pharmacyId]);
  const setReview = useReviews((s) => s.setReview);
  const summary = mergeRating(baseRating, reviewCount, mine?.stars);
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(mine?.stars || 0);
  const [comment, setComment] = useState(mine?.comment || '');

  const like = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleLike(pharmacyId);
  };

  const openAvis = () => {
    setStars(mine?.stars || 0);
    setComment(mine?.comment || '');
    setOpen(true);
  };

  const save = () => {
    if (stars < 1) return;
    setReview(pharmacyId, { stars, comment: comment.trim() || undefined });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setOpen(false);
  };

  return (
    <>
      <View style={s.bar}>
        <Pressable
          onPress={like}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          style={({ pressed }) => [s.like, pressed && { opacity: 0.55, transform: [{ scale: 0.88 }] }]}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? colors.danger : colors.muted} />
        </Pressable>
        <View style={s.rating}>
          <StarRow value={summary.rating} />
          <Text style={s.score}>
            {formatRating(summary.rating)} ({summary.count})
          </Text>
        </View>
        <Pressable onPress={openAvis} style={({ pressed }) => [s.avis, pressed && { opacity: 0.7 }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.primary} />
          <Text style={s.avisText}>{mine ? 'Modifier' : 'Avis'}</Text>
        </Pressable>
      </View>
      {mine ? <Text style={s.yours}>Votre avis : {mine.stars}/5</Text> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.mask} onPress={() => setOpen(false)}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={s.sheetTitle}>Avis sur le service</Text>
            <Text style={s.sheetMeta}>{name}</Text>
            <View style={{ marginTop: 14, alignItems: 'center' }}>
              <StarRow value={stars} onPick={setStars} size={32} />
            </View>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Un mot sur la rapidité, le stock, l’accueil…"
              placeholderTextColor={colors.muted}
              multiline
              style={s.input}
            />
            <Pressable
              onPress={save}
              disabled={stars < 1}
              style={({ pressed }) => [s.save, stars < 1 && { opacity: 0.4 }, pressed && { opacity: 0.8 }]}
            >
              <Text style={s.saveText}>Enregistrer</Text>
            </Pressable>
            <Text onPress={() => setOpen(false)} style={s.cancel}>
              Annuler
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  like: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rating: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starHit: { paddingHorizontal: 1 },
  score: { fontSize: 12, fontWeight: '800', color: colors.muted },
  avis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
  },
  avisText: { fontWeight: '800', color: colors.primary, fontSize: 13 },
  yours: { marginTop: 6, fontSize: 12, fontWeight: '700', color: colors.primaryDark },
  mask: { flex: 1, backgroundColor: 'rgba(7,20,40,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 22,
    paddingBottom: 32,
  },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  sheetMeta: { marginTop: 4, color: colors.muted, fontWeight: '700' },
  input: {
    marginTop: 16,
    minHeight: 88,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    textAlignVertical: 'top',
    color: colors.text,
    fontWeight: '600',
  },
  save: {
    marginTop: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { fontWeight: '800', color: colors.onPrimary },
  cancel: { textAlign: 'center', marginTop: 14, fontWeight: '800', color: colors.muted },
});
