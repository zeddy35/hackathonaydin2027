import { z } from "zod";

/*
 * Application form: field keys, option lists and validation. Shared by the
 * form (client) and the server actions, so both validate the same way.
 * Answers are stored in applications.answers (jsonb) under these keys.
 */

export const LEVELS = ["highschool", "associate", "bachelor", "graduate", "bootcamp", "vocational", "postdoc", "not_student", "other"] as const;
export const ROLES = ["frontend", "backend", "mobile", "ai_ml", "design", "product", "other"] as const;
export const EXPERIENCE = ["beginner", "intermediate", "advanced"] as const;
export const TSHIRTS = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export const TEAM_STATUS = ["have", "looking"] as const;
export const PRIOR = ["yes", "no"] as const;

/** MLH registration "level of study" values, used by the MLH export. */
export const MLH_LEVEL: Record<(typeof LEVELS)[number], string> = {
  highschool: "Secondary / High School",
  associate: "Undergraduate University (2 year - community college or similar)",
  bachelor: "Undergraduate University (3+ year)",
  graduate: "Graduate University (Masters, Professional, Doctoral, etc)",
  bootcamp: "Code School / Bootcamp",
  vocational: "Other Vocational / Trade Program or Apprenticeship",
  postdoc: "Post Doctorate",
  not_student: "I'm not currently a student",
  other: "Other",
};

export const MOTIVATION_MAX = 500;
/** Organizer decision: participants must be 18 or older (also enforced in the database). */
export const MIN_AGE = 18;
export const CV_MAX_BYTES = 5 * 1024 * 1024;

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1);
const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\/[^\s]+\.[^\s]+$/i.test(v), "url");
const phone = z
  .string()
  .trim()
  .max(30)
  .refine((v) => /^\+?[0-9 ()-]{7,20}$/.test(v), "phone");

/** Strict schema for submitting. */
export const submitSchema = z.object({
  first_name: required(60),
  last_name: required(60),
  phone,
  age: z
    .string()
    .trim()
    .refine((v) => /^[0-9]{1,3}$/.test(v) && +v >= 10 && +v <= 99, "age")
    .refine((v) => !/^[0-9]{1,3}$/.test(v) || +v >= MIN_AGE, "age_min"),
  university: required(120),
  department: required(120),
  level: z.enum(LEVELS),
  grad_year: z
    .string()
    .trim()
    .refine((v) => /^20[0-9]{2}$/.test(v) && +v >= 2000 && +v <= 2040, "year"),
  country: required(60),
  city: required(60),
  team_status: z.enum(TEAM_STATUS),
  roles: z.array(z.enum(ROLES)).min(1).max(ROLES.length),
  experience: z.enum(EXPERIENCE),
  motivation: required(MOTIVATION_MAX),
  tshirt: z.enum(TSHIRTS),
  diet: text(300),
  emergency_name: required(120),
  emergency_phone: phone,
  github: url,
  linkedin: url,
  portfolio: url,
  cv_path: text(200),
  prior_hackathon: z.union([z.enum(PRIOR), z.literal("")]),
});

export type Answers = z.infer<typeof submitSchema>;
export type FieldKey = keyof Answers;

/** Drafts accept anything partial, but still cap lengths and types. */
export const draftSchema = z.object({
  first_name: text(60),
  last_name: text(60),
  phone: text(30),
  age: text(3),
  university: text(120),
  department: text(120),
  level: z.union([z.enum(LEVELS), z.literal("")]),
  grad_year: text(4),
  country: text(60),
  city: text(60),
  team_status: z.union([z.enum(TEAM_STATUS), z.literal("")]),
  roles: z.array(z.enum(ROLES)).max(ROLES.length),
  experience: z.union([z.enum(EXPERIENCE), z.literal("")]),
  motivation: text(MOTIVATION_MAX),
  tshirt: z.union([z.enum(TSHIRTS), z.literal("")]),
  diet: text(300),
  emergency_name: text(120),
  emergency_phone: text(30),
  github: text(300),
  linkedin: text(300),
  portfolio: text(300),
  cv_path: text(200),
  prior_hackathon: z.union([z.enum(PRIOR), z.literal("")]),
});

export type DraftAnswers = z.infer<typeof draftSchema>;

export const emptyAnswers: DraftAnswers = {
  first_name: "",
  last_name: "",
  phone: "",
  age: "",
  university: "",
  department: "",
  level: "",
  grad_year: "",
  country: "Türkiye",
  city: "",
  team_status: "",
  roles: [],
  experience: "",
  motivation: "",
  tshirt: "",
  diet: "",
  emergency_name: "",
  emergency_phone: "",
  github: "",
  linkedin: "",
  portfolio: "",
  cv_path: "",
  prior_hackathon: "",
};

/** Normalises whatever is stored in the database into a full draft object. */
export function toDraft(raw: unknown): DraftAnswers {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out = { ...emptyAnswers } as Record<string, unknown>;
  for (const k of Object.keys(emptyAnswers)) {
    const v = src[k];
    if (k === "roles") out[k] = Array.isArray(v) ? v.filter((x) => (ROLES as readonly string[]).includes(x)) : [];
    else if (typeof v === "string") out[k] = v;
    else if (typeof v === "number") out[k] = String(v);
  }
  return out as DraftAnswers;
}

/*
 * Consents. Each is its own checkbox and its own record with a timestamp.
 * Required consents and marketing permissions are never combined.
 */
export const CONSENTS = ["kvkk", "coc", "rules", "mlh_coc", "mlh_share", "mlh_marketing", "marketing"] as const;
export type ConsentKey = (typeof CONSENTS)[number];
export type ConsentRecord = { accepted: boolean; at: string };
export type Consents = Partial<Record<ConsentKey, ConsentRecord>>;

export function requiredConsents(mlhEnabled: boolean): ConsentKey[] {
  return mlhEnabled ? ["kvkk", "coc", "rules", "mlh_coc", "mlh_share"] : ["kvkk", "coc", "rules"];
}

export function visibleConsents(mlhEnabled: boolean): ConsentKey[] {
  return mlhEnabled ? [...CONSENTS] : ["kvkk", "coc", "rules", "marketing"];
}

/** Merges checkbox values into stored consents, keeping the original time of unchanged answers. */
export function mergeConsents(prev: Consents, next: Partial<Record<ConsentKey, boolean>>, allowed: ConsentKey[]): Consents {
  const now = new Date().toISOString();
  const out: Consents = { ...prev };
  for (const key of allowed) {
    const value = next[key] === true;
    if (prev[key]?.accepted === value) continue;
    if (!prev[key] && !value) continue;
    out[key] = { accepted: value, at: now };
  }
  return out;
}

/** Turkish universities for the suggestion list. Free text is always allowed. */
export const UNIVERSITIES = [
  "Aydın Adnan Menderes Üniversitesi",
  "Ankara Üniversitesi",
  "Akdeniz Üniversitesi",
  "Anadolu Üniversitesi",
  "Atatürk Üniversitesi",
  "Bahçeşehir Üniversitesi",
  "Başkent Üniversitesi",
  "Bilkent Üniversitesi",
  "Boğaziçi Üniversitesi",
  "Bursa Uludağ Üniversitesi",
  "Manisa Celal Bayar Üniversitesi",
  "Çukurova Üniversitesi",
  "Dokuz Eylül Üniversitesi",
  "Ege Üniversitesi",
  "Erciyes Üniversitesi",
  "Eskişehir Osmangazi Üniversitesi",
  "Gazi Üniversitesi",
  "Galatasaray Üniversitesi",
  "Hacettepe Üniversitesi",
  "İstanbul Teknik Üniversitesi",
  "İstanbul Üniversitesi",
  "İzmir Bakırçay Üniversitesi",
  "İzmir Demokrasi Üniversitesi",
  "İzmir Ekonomi Üniversitesi",
  "İzmir Katip Çelebi Üniversitesi",
  "İzmir Yüksek Teknoloji Enstitüsü",
  "Karadeniz Teknik Üniversitesi",
  "Koç Üniversitesi",
  "Marmara Üniversitesi",
  "Muğla Sıtkı Koçman Üniversitesi",
  "Ortadoğu Teknik Üniversitesi",
  "Pamukkale Üniversitesi",
  "Sabancı Üniversitesi",
  "Sakarya Üniversitesi",
  "Selçuk Üniversitesi",
  "Süleyman Demirel Üniversitesi",
  "TOBB Ekonomi ve Teknoloji Üniversitesi",
  "Yaşar Üniversitesi",
  "Yıldız Teknik Üniversitesi",
];
