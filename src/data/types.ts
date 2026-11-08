/**
 * Content models. Stored in Supabase (settings, sponsors, people) and read
 * through the getters in `src/data/index.ts`. The files in this folder are the
 * defaults used when the database is not configured.
 */

export type ApplicationStatus = "upcoming" | "open" | "closed";

export type SiteConfig = {
  application: {
    status: ApplicationStatus;
    /** Page key of the application form (resolved per language in src/lib/routes.ts). */
    formPage: "panel";
    /** When applications open. Only the month is confirmed, so this is display copy, not a date. */
    opensLabel: { tr: string; en: string };
  };
  event: {
    /** Opening ceremony, Europe/Istanbul. */
    kickoff: string;
    /** Awards, Europe/Istanbul. After this the event counts as finished. */
    end: string;
  };
  /** Europe/Istanbul ISO times, enforced again in the database. */
  deadlines: {
    hackStart: string;
    submission: string;
    /** Accepted participants confirm attendance by this time. Null: not set yet. */
    confirm: string | null;
  };
  mlh: {
    /** Show the MLH fields on the application form. Keep false until MLH confirms membership. */
    enabled: boolean;
    /** Render the MLH Season Trust Badge. Keep false until MLH confirms membership. */
    badge: boolean;
    badgeHref: string;
    badgeImage: string;
  };
  contact: { email: string };
  social: { instagram: string };
};

export type SponsorTier = "title" | "gold" | "silver" | "inkind" | "tech" | "community";

export type Sponsor = {
  id: string;
  name: string;
  tier: SponsorTier;
  /** Path under /public (e.g. /sponsors/acme.svg) or null to show the name as text. */
  logo: string | null;
  url: string;
  order: number;
  published: boolean;
};

export type Person = {
  id: string;
  name: string;
  role: string;
  org: string;
  photo: string | null;
  url: string | null;
  kind: "judge" | "mentor";
  published: boolean;
};

export type ScheduleKey =
  | "checkin"
  | "opening"
  | "hackStart"
  | "dinner"
  | "submit"
  | "finalistDemos"
  | "finalistsAnnounced"
  | "finals"
  | "awards";

export type ScheduleItem = {
  day: "sat" | "sun";
  time: string;
  tr: string;
  en: string;
  key: ScheduleKey;
  draft: boolean;
};
