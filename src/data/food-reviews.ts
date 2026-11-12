/**
 * Participant comments about the food at past editions.
 * Real quotes only, each with the person's written or messaged permission.
 * Keep published: false until permission is in hand. No made-up names, quotes or ratings.
 */
export type FoodReview = {
  /** The participant's own words. Turkish is the original; add en only if they gave one. */
  quote: { tr: string; en?: string };
  /** As the person allowed: "Elif, 2026" or "2026 katılımcısı". */
  author: string;
  year: 2025 | 2026;
  /** Only if the participant actually gave a rating. */
  rating?: 1 | 2 | 3 | 4 | 5;
  published: boolean;
};

/** Filled in by the organizers. */
export const foodReviews: FoodReview[] = [];
