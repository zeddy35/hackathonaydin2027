import { MLH_LEVEL } from "./application";

/** Columns available for the CSV export. `get` receives the joined row. */
export type ExportRow = {
  id: string;
  status: string;
  submitted_at: string | null;
  checked_in_at: string | null;
  is_minor: boolean;
  wants_match: boolean;
  email: string;
  answers: Record<string, unknown>;
  consents: Record<string, { accepted?: boolean; at?: string }>;
  team: string;
};

const a = (k: string) => (r: ExportRow) => {
  const v = r.answers[k];
  return Array.isArray(v) ? v.join(";") : v == null ? "" : String(v);
};
const consent = (k: string) => (r: ExportRow) => (r.consents[k]?.accepted ? r.consents[k]?.at ?? "yes" : "");

export const EXPORT_COLUMNS: { key: string; label: string; get: (r: ExportRow) => string }[] = [
  { key: "first_name", label: "Ad", get: a("first_name") },
  { key: "last_name", label: "Soyad", get: a("last_name") },
  { key: "email", label: "E-posta", get: (r) => r.email },
  { key: "phone", label: "Telefon", get: a("phone") },
  { key: "age", label: "Yaş", get: a("age") },
  { key: "is_minor", label: "18 yaş altı", get: (r) => (r.is_minor ? "evet" : "") },
  { key: "university", label: "Üniversite", get: a("university") },
  { key: "department", label: "Bölüm", get: a("department") },
  { key: "level", label: "Düzey", get: a("level") },
  { key: "grad_year", label: "Mezuniyet yılı", get: a("grad_year") },
  { key: "country", label: "Ülke", get: a("country") },
  { key: "city", label: "Şehir", get: a("city") },
  { key: "team_status", label: "Takım durumu", get: a("team_status") },
  { key: "wants_match", label: "Eşleştirme istiyor", get: (r) => (r.wants_match ? "evet" : "") },
  { key: "team", label: "Takım", get: (r) => r.team },
  { key: "roles", label: "Roller", get: a("roles") },
  { key: "experience", label: "Deneyim", get: a("experience") },
  { key: "motivation", label: "Motivasyon", get: a("motivation") },
  { key: "tshirt", label: "Tişört", get: a("tshirt") },
  { key: "diet", label: "Beslenme", get: a("diet") },
  { key: "emergency_name", label: "Acil durum kişisi", get: a("emergency_name") },
  { key: "emergency_phone", label: "Acil durum telefonu", get: a("emergency_phone") },
  { key: "github", label: "GitHub", get: a("github") },
  { key: "linkedin", label: "LinkedIn", get: a("linkedin") },
  { key: "portfolio", label: "Portfolyo", get: a("portfolio") },
  { key: "prior_hackathon", label: "Önceki hackathon", get: a("prior_hackathon") },
  { key: "status", label: "Durum", get: (r) => r.status },
  { key: "submitted_at", label: "Başvuru zamanı", get: (r) => r.submitted_at ?? "" },
  { key: "checked_in_at", label: "Check-in zamanı", get: (r) => r.checked_in_at ?? "" },
  { key: "consent_marketing", label: "Duyuru izni", get: consent("marketing") },
];

export const DEFAULT_COLUMNS = ["first_name", "last_name", "email", "university", "department", "level", "team_status", "status", "submitted_at"];

/** MLH registration data: required fields and the checkbox answers, in MLH's English wording. */
export const MLH_COLUMNS: { label: string; get: (r: ExportRow) => string }[] = [
  { label: "First Name", get: a("first_name") },
  { label: "Last Name", get: a("last_name") },
  { label: "Age", get: a("age") },
  { label: "Email", get: (r) => r.email },
  { label: "School Name", get: a("university") },
  { label: "Phone Number", get: a("phone") },
  { label: "Country of Residence", get: a("country") },
  { label: "Level of Study", get: (r) => MLH_LEVEL[r.answers.level as keyof typeof MLH_LEVEL] ?? "" },
  { label: "MLH Code of Conduct", get: (r) => (r.consents.mlh_coc?.accepted ? "Yes" : "No") },
  { label: "MLH Privacy Policy and Contest Terms", get: (r) => (r.consents.mlh_share?.accepted ? "Yes" : "No") },
  { label: "MLH Marketing Emails", get: (r) => (r.consents.mlh_marketing?.accepted ? "Yes" : "No") },
  { label: "Checked In", get: (r) => (r.status === "checked_in" ? "Yes" : "No") },
];

export function toCsv(header: string[], rows: string[][]) {
  const cell = (v: string) => {
    // Neutralise spreadsheet formulas, then quote.
    const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
}
