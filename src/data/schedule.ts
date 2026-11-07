import type { ScheduleItem } from "./types";

/** Draft programme. Times are Europe/Istanbul. Do not add workshop or mentoring slots until confirmed. */
export const schedule: ScheduleItem[] = [
  { day: "sat", time: "08:30", key: "checkin", tr: "Kayıt", en: "Check-in", draft: true },
  { day: "sat", time: "10:00", key: "opening", tr: "Açılış ve temanın açıklanması", en: "Opening and theme reveal", draft: true },
  { day: "sat", time: "11:00", key: "hackStart", tr: "Geliştirme başlar", en: "Hacking starts", draft: true },
  { day: "sat", time: "19:00", key: "dinner", tr: "Akşam yemeği", en: "Dinner", draft: true },
  { day: "sun", time: "15:00", key: "submit", tr: "Teslim", en: "Submissions close", draft: true },
  { day: "sun", time: "15:15", key: "finalistDemos", tr: "Finalist seçimi (masalarda demo)", en: "Finalist selection (demos at tables)", draft: true },
  { day: "sun", time: "17:30", key: "finalistsAnnounced", tr: "Finalistler açıklanır", en: "Finalists announced", draft: true },
  { day: "sun", time: "18:00", key: "finals", tr: "Final sunumları", en: "Final presentations", draft: true },
  { day: "sun", time: "20:15", key: "awards", tr: "Ödüller", en: "Awards", draft: true },
];
