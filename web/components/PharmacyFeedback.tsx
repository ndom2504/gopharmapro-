'use client';

import { useEffect, useState } from 'react';
import { formatRating, mergeRating, type PharmacyReview } from '@/lib/pharmacyRating';

const LIKES_KEY = 'gpp-likes-v1';
const REVIEWS_KEY = 'gpp-reviews-v1';

function readLikes(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(LIKES_KEY) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function readReviews(): Record<string, PharmacyReview> {
  try {
    const raw = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
}

function StarRow({ value, onPick, size = 18 }: { value: number; onPick?: (n: number) => void; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= Math.round(value);
        const cls = on ? 'text-warning' : 'text-border';
        if (!onPick) {
          return (
            <svg key={n} width={size} height={size} viewBox="0 0 24 24" className={cls} aria-hidden>
              <path
                fill={on ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.6"
                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          );
        }
        return (
          <button
            key={n}
            type="button"
            onClick={() => onPick(n)}
            className={`transition hover:scale-110 active:scale-90 ${cls}`}
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            <svg width={size} height={size} viewBox="0 0 24 24">
              <path
                fill={on ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.6"
                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          </button>
        );
      })}
    </span>
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
  const [likes, setLikes] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Record<string, PharmacyReview>>({});
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const liked = likes.includes(pharmacyId);
  const mine = reviews[pharmacyId];
  const summary = mergeRating(baseRating, reviewCount, mine?.stars);

  useEffect(() => {
    setLikes(readLikes());
    setReviews(readReviews());
  }, []);

  const toggleLike = () => {
    const next = liked ? likes.filter((id) => id !== pharmacyId) : [...likes, pharmacyId];
    setLikes(next);
    localStorage.setItem(LIKES_KEY, JSON.stringify(next));
  };

  const openAvis = () => {
    setStars(mine?.stars || 0);
    setComment(mine?.comment || '');
    setOpen(true);
  };

  const save = () => {
    if (stars < 1) return;
    const next = { ...reviews, [pharmacyId]: { stars, comment: comment.trim() || undefined } };
    setReviews(next);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
    setOpen(false);
  };

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleLike}
          aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-mint transition hover:bg-mint/80 active:scale-90"
        >
          <Heart filled={liked} />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <StarRow value={summary.rating} />
          <span className="text-xs font-extrabold text-muted">
            {formatRating(summary.rating)} ({summary.count})
          </span>
        </div>
        <button
          type="button"
          onClick={openAvis}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-brand/30 bg-mint px-2.5 text-sm font-extrabold text-brand transition active:scale-95"
        >
          {mine ? 'Modifier' : 'Avis'}
        </button>
      </div>
      {mine ? <p className="mt-1.5 text-xs font-bold text-brand-dark">Votre avis : {mine.stars}/5</p> : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-xl font-extrabold text-ink">Avis sur le service</p>
            <p className="mt-1 text-sm font-bold text-muted">{name}</p>
            <div className="mt-4 flex justify-center">
              <StarRow value={stars} onPick={setStars} size={32} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Un mot sur la rapidité, le stock, l’accueil…"
              className="mt-4 min-h-24 w-full rounded-2xl border border-border px-4 py-3 font-semibold text-ink outline-none focus:border-brand"
            />
            <button type="button" disabled={stars < 1} onClick={save} className="btn-primary mt-4 w-full disabled:opacity-40">
              Enregistrer
            </button>
            <button type="button" onClick={() => setOpen(false)} className="mt-3 w-full text-sm font-extrabold text-muted">
              Annuler
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className={filled ? 'text-danger' : 'text-muted'} aria-hidden>
      {filled ? (
        <path
          fill="currentColor"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.4 10.05z"
        />
      )}
    </svg>
  );
}

export function useLikedPharmacies() {
  const [likes, setLikes] = useState<string[]>([]);
  useEffect(() => {
    setLikes(readLikes());
  }, []);
  return likes;
}
