import type { SiteConfig } from "./types";

/** The one place for the public contact address. Swap it here when the domain e-mail exists. */
export const contactEmail = "zerdendereli@gmail.com";

/**
 * Defaults. When Supabase is configured, the admin panel (İçerik) overrides
 * application status, dates and MLH flags from the `settings` table.
 */
export const site: SiteConfig = {
  application: {
    status: "upcoming",
    formPage: "panel",
    opensLabel: { tr: "Ocak 2027", en: "January 2027" },
    deadline: "2027-03-31T23:59:00+03:00",
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
  contact: { email: contactEmail },
  social: { instagram: "https://www.instagram.com/hackathonaydin2027/" },
};
