import type { ScheduleItem } from "./types";

/**
 * Draft programme. Times are Europe/Istanbul. Do not add workshop or mentoring slots until confirmed.
 * Building runs Saturday 12:00 to Sunday 12:00 (24 hours, decided 11 November 2026).
 * Meals and night activities are kind: "break"; night: true adds the small moon mark.
 */
export const schedule: ScheduleItem[] = [
  { day: "sat", time: "09:30", key: "checkin", tr: "Kayıt", en: "Check-in", draft: true },
  { day: "sat", time: "11:00", key: "opening", tr: "Açılış ve temanın açıklanması", en: "Opening and theme reveal", draft: true },
  { day: "sat", time: "12:00", key: "hackStart", tr: "Geliştirme başlar", en: "Hacking starts", draft: true },
  { day: "sat", time: "13:30", key: "lunch", tr: "Öğle yemeği", en: "Lunch", draft: true, kind: "break" },
  { day: "sat", time: "19:00", key: "dinner", tr: "Akşam yemeği", en: "Dinner", draft: true, kind: "break" },
  { day: "sat", time: "23:00", key: "games", tr: "Gece mini oyunları", en: "Late-night mini games", draft: true, kind: "break", night: true },
  { day: "sun", time: "00:00", key: "snack", tr: "Gece yarısı atıştırmalığı", en: "Midnight snack", draft: true, kind: "break", night: true },
  { day: "sun", time: "08:00", key: "breakfast", tr: "Kahvaltı", en: "Breakfast", draft: true, kind: "break" },
  { day: "sun", time: "12:00", key: "submit", tr: "Teslim", en: "Submissions close", draft: true },
  { day: "sun", time: "12:30", key: "lunchSun", tr: "Öğle yemeği", en: "Lunch", draft: true, kind: "break" },
  { day: "sun", time: "13:30", key: "finalistDemos", tr: "Finalist seçimi (masalarda demo)", en: "Finalist selection (demos at tables)", draft: true },
  { day: "sun", time: "15:30", key: "finalistsAnnounced", tr: "Finalistler açıklanır", en: "Finalists announced", draft: true },
  { day: "sun", time: "16:00", key: "finals", tr: "Final sunumları", en: "Final presentations", draft: true },
  { day: "sun", time: "18:15", key: "awards", tr: "Ödüller", en: "Awards", draft: true },
];
