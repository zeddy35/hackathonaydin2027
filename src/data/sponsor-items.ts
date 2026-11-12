import type { ScheduleKey } from "./types";

/**
 * Parts of the event a sponsor can take on (organizer decision, 12 November 2026).
 * No prices here or on the site. Lunch, dinner and breakfast are not
 * sponsor items; do not add them.
 *
 * What the sponsor gets: the name on the item card, on the matching programme line
 * (`slot`, when the item has one) and a mention on stage.
 *
 * `p`: one sentence on what the sponsor's name is attached to. Only what is confirmed
 * elsewhere on the site (programme, venue, packages); no opening hours, footfall or
 * reach claims until the organizers give them.
 *
 * `by`: the sponsor's name, only once the agreement is confirmed. Empty means "open".
 */
export type SponsorItem = { key: string; tr: string; en: string; p: { tr: string; en: string }; slot?: ScheduleKey; by?: string };

export const sponsorItems: SponsorItem[] = [
  {
    key: "prizes",
    tr: "Kategori ödülleri",
    en: "Category prizes",
    p: { tr: "Ödül töreninde bir kategori ödülü senin adınla verilir.", en: "A category prize is handed out in your name at the awards ceremony." },
    slot: "awards",
  },
  {
    key: "games",
    tr: "Gece mini oyun turnuvası",
    en: "Late-night mini game tournament",
    p: { tr: "Cumartesi gecesi takımların mola verdiği turnuva senin adınla oynanır.", en: "The Saturday night tournament where teams take a break is played under your name." },
    slot: "games",
  },
  {
    key: "coffee",
    tr: "Kahve barı",
    en: "Coffee bar",
    p: { tr: "Takımların geliştirme sırasında kahve aldığı nokta senin adını taşır.", en: "The spot where teams get their coffee while building carries your name." },
  },
  {
    key: "snack",
    tr: "Gece yarısı atıştırmalığı",
    en: "Midnight snack",
    p: { tr: "Gece yarısı molasındaki atıştırmalık senin adınla sunulur.", en: "The snack at the midnight break is served in your name." },
    slot: "snack",
  },
  {
    key: "rest",
    tr: "Dinlenme alanı",
    en: "Rest area",
    p: { tr: "Gece boyunca açık, armut koltuklu dinlenme alanı senin adını taşır.", en: "The bean bag rest area, open all night, carries your name." },
  },
  {
    key: "stage",
    tr: "Sahne ve canlı yayın",
    en: "Stage and live stream",
    p: { tr: "Açılışın, final sunumlarının ve ödül töreninin sahnesinde ve canlı yayında adın yer alır.", en: "Your name is on the stage of the opening, the final presentations and the awards, and on the live stream." },
  },
  {
    key: "tshirt",
    tr: "Tişört",
    en: "T-shirt",
    p: { tr: "Katılımcılara verilen etkinlik tişörtünde logon yer alır.", en: "Your logo is on the event T-shirt given to participants." },
  },
];

/** Programme line → sponsor name, for the items that are taken and have a line. */
export const scheduleCredits = (): Partial<Record<ScheduleKey, string>> =>
  Object.fromEntries(sponsorItems.filter((i) => i.slot && i.by).map((i) => [i.slot, i.by]));
