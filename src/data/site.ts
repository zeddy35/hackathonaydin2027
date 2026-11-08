import type { SiteConfig } from "./types";

/**
 * Defaults. When Supabase is configured, the admin panel (İçerik) overrides
 * application status, dates and MLH flags from the `settings` table.
 */
export const site: SiteConfig = {
  application: {
    status: "upcoming",
    formPage: "panel",
    opensLabel: { tr: "Ocak 2027", en: "January 2027" },
  },
  event: {
    kickoff: "2027-04-17T10:00:00+03:00",
    end: "2027-04-18T20:15:00+03:00",
  },
  deadlines: {
    hackStart: "2027-04-17T11:00:00+03:00",
    submission: "2027-04-18T15:00:00+03:00",
    confirm: null,
  },
  mlh: {
    enabled: false,
    badge: false,
    badgeHref: "",
    badgeImage: "",
  },
  contact: { email: "zerdendereli@gmail.com" },
  social: { instagram: "https://www.instagram.com/hackathonaydin2027/" },
};
