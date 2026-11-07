/**
 * Content models. Task 4 moves these into the database, so keep the shapes
 * flat and serialisable. Components never import the data files directly;
 * they call the getters in `src/data/index.ts`.
 */

export type ApplicationStatus = "upcoming" | "open" | "closed";

export type SiteConfig = {
  application: {
    status: ApplicationStatus;
    /** Page key of the application form (resolved per language in src/lib/routes.ts). */
    formPage: "apply";
    /** When applications open. Only the month is confirmed, so this is display copy, not a date. */
    opensLabel: { tr: string; en: string };
  };
  event: {
    /** Opening ceremony, Europe/Istanbul. */
    kickoff: string;
    /** Awards, Europe/Istanbul. After this the event counts as finished. */
    end: string;
  };
  mlh: {
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
