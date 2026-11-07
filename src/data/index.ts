import { people } from "./people";
import { schedule } from "./schedule";
import { site } from "./site";
import { sponsors } from "./sponsors";
import type { Person, ScheduleItem, SiteConfig, Sponsor } from "./types";

export type * from "./types";

/*
 * Single entry point for site content. Async on purpose: task 4 replaces the
 * bodies with database reads without touching the components.
 */

export async function getSiteConfig(): Promise<SiteConfig> {
  return site;
}

export async function getSponsors(): Promise<Sponsor[]> {
  let list = sponsors;
  // Layout testing only. `process.env.NODE_ENV` is inlined at build time, so
  // this branch and the example file are dropped from production bundles.
  if (process.env.NODE_ENV === "development" && process.env.SPONSORS_EXAMPLE === "1") {
    list = (await import("./sponsors.example")).exampleSponsors;
  }
  return list.filter((s) => s.published).sort((a, b) => a.order - b.order);
}

export async function getPeople(kind?: Person["kind"]): Promise<Person[]> {
  return people.filter((p) => p.published && (!kind || p.kind === kind));
}

export async function getSchedule(): Promise<ScheduleItem[]> {
  return schedule;
}
