export type Criterion = { key: string; tr: string; en: string; weight: number };
export type Round = "finalist_selection" | "final";
export const ROUNDS: Round[] = ["finalist_selection", "final"];
export const ROUND_LABELS: Record<Round, string> = { finalist_selection: "Finalist seçimi", final: "Final" };

export function parseCriteria(v: unknown): Criterion[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((c): c is Criterion => c && typeof c.key === "string" && typeof c.weight === "number")
    .map((c) => ({ key: c.key, tr: String(c.tr ?? c.key), en: String(c.en ?? c.key), weight: c.weight }));
}

/** Weighted mean of one judge's sheet on a 1-10 scale. Null if no criterion was scored. */
export function weighted(criteria: Criterion[], values: Record<string, number>): number | null {
  let sum = 0;
  let w = 0;
  for (const c of criteria) {
    const v = values[c.key];
    if (typeof v === "number") {
      sum += v * c.weight;
      w += c.weight;
    }
  }
  return w ? sum / w : null;
}

export type ResultRow = { submissionId: string; mean: number | null; judges: number; sd: number | null };

/** Per submission: mean of the judges' weighted scores, number of judges, standard deviation. */
export function results(
  criteria: Criterion[],
  scores: { submission_id: string; criteria: Record<string, number> }[]
): Map<string, ResultRow> {
  const bySub = new Map<string, number[]>();
  for (const s of scores) {
    const w = weighted(criteria, s.criteria ?? {});
    if (w === null) continue;
    bySub.set(s.submission_id, [...(bySub.get(s.submission_id) ?? []), w]);
  }
  const out = new Map<string, ResultRow>();
  for (const [id, xs] of bySub) {
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const sd = xs.length > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1)) : null;
    out.set(id, { submissionId: id, mean, judges: xs.length, sd });
  }
  return out;
}
