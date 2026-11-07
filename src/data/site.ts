import type { SiteConfig } from "./types";

/**
 * Change `application.status` to "open" when the form is live (task 3),
 * and to "closed" when applications end.
 */
export const site: SiteConfig = {
  application: {
    status: "upcoming",
    formPage: "apply",
    opensLabel: { tr: "Ocak 2027", en: "January 2027" },
  },
  event: {
    kickoff: "2027-04-17T10:00:00+03:00",
    end: "2027-04-18T20:15:00+03:00",
  },
  mlh: {
    badge: false,
    badgeHref: "",
    badgeImage: "",
  },
  contact: { email: "zerdendereli@gmail.com" },
  social: { instagram: "https://www.instagram.com/hackathonaydin2027/" },
};
