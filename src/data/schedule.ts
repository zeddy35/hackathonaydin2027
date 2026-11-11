import type { ScheduleItem } from "./types";

/**
 * Draft programme. Times are Europe/Istanbul. Do not add workshop or mentoring slots until confirmed.
 * Meal and night slots (kind: "break") are drafts too; times await organizer approval (docs/organizator-notlari.md).
 */
export const schedule: ScheduleItem[] = [
  { day: "sat", time: "08:30", key: "checkin", tr: "Kayıt", en: "Check-in", draft: true },
  { day: "sat", time: "10:00", key: "opening", tr: "Açılış ve temanın açıklanması", en: "Opening and theme reveal", draft: true },
  { day: "sat", time: "11:00", key: "hackStart", tr: "Geliştirme başlar", en: "Hacking starts", draft: true },
  { day: "sat", time: "13:00", key: "lunch", tr: "Öğle yemeği", en: "Lunch", draft: true, kind: "break" },
  { day: "sat", time: "19:00", key: "dinner", tr: "Akşam yemeği", en: "Dinner", draft: true, kind: "break" },
  { day: "sat", time: "23:00", key: "tournament", tr: "Gece mini oyun turnuvası", en: "Late-night mini game tournament", draft: true, kind: "break" },
  { day: "sun", time: "02:00", key: "snack", tr: "Gece atıştırmalığı", en: "Midnight snack", draft: true, kind: "break" },
  { day: "sun", time: "08:00", key: "breakfast", tr: "Kahvaltı", en: "Breakfast", draft: true, kind: "break" },
  { day: "sun", time: "15:00", key: "submit", tr: "Teslim", en: "Submissions close", draft: true },
  { day: "sun", time: "15:15", key: "finalistDemos", tr: "Finalist seçimi (masalarda demo)", en: "Finalist selection (demos at tables)", draft: true },
  { day: "sun", time: "17:30", key: "finalistsAnnounced", tr: "Finalistler açıklanır", en: "Finalists announced", draft: true },
  { day: "sun", time: "18:00", key: "finals", tr: "Final sunumları", en: "Final presentations", draft: true },
  { day: "sun", time: "20:15", key: "awards", tr: "Ödüller", en: "Awards", draft: true },
];
