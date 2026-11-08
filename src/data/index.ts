import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { people as staticPeople } from "./people";
import { schedule } from "./schedule";
import { site as defaults } from "./site";
import { sponsors as staticSponsors } from "./sponsors";
import type { ApplicationStatus, Person, ScheduleItem, SiteConfig, Sponsor, SponsorTier } from "./types";

export type * from "./types";

/*
 * Single entry point for site content. Reads the public rows from Supabase with
 * the anon key (RLS: only public settings and published sponsors/people).
 * Results are cached and tagged; the admin panel calls revalidateTag(CONTENT_TAG)
 * after every change, and they also refresh on their own every 5 minutes.
 *
 * No database configured: the defaults in this folder.
 * Database unreachable: defaults for settings, empty lists for sponsors and people.
 * Never example or invented data.
 */

export const CONTENT_TAG = "content";

function publicClient() {
  if (!supabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, next: { tags: [CONTENT_TAG], revalidate: 300 } }),
    },
  });
}

const str = (v: unknown) => (typeof v === "string" && v ? v : null);

export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const db = publicClient();
  if (!db) return defaults;
  const { data, error } = await db.from("settings").select("key, value");
  if (error || !data) {
    console.error("getSiteConfig: settings unavailable, using defaults:", error?.message);
    return defaults;
  }
  const s = Object.fromEntries(data.map((r) => [r.key as string, r.value as unknown]));
  const status = (["upcoming", "open", "closed"] as const).includes(s.application_status as ApplicationStatus)
    ? (s.application_status as ApplicationStatus)
    : defaults.application.status;
  const label = s.applications_open_label as { tr?: string; en?: string } | undefined;

  return {
    ...defaults,
    application: {
      ...defaults.application,
      status,
      opensLabel: { tr: label?.tr || defaults.application.opensLabel.tr, en: label?.en || defaults.application.opensLabel.en },
    },
    deadlines: {
      hackStart: str(s.hack_start) ?? defaults.deadlines.hackStart,
      submission: str(s.submission_deadline) ?? defaults.deadlines.submission,
      confirm: str(s.confirm_deadline),
    },
    mlh: {
      enabled: s.mlh_enabled === true,
      badge: s.mlh_badge === true,
      badgeHref: str(s.mlh_badge_href) ?? "",
      badgeImage: str(s.mlh_badge_image) ?? "",
    },
  };
});

const TIERS: SponsorTier[] = ["title", "gold", "silver", "inkind", "tech", "community"];

export const getSponsors = cache(async (): Promise<Sponsor[]> => {
  let list: Sponsor[] = staticSponsors;
  const db = publicClient();
  if (db) {
    const { data, error } = await db
      .from("sponsors")
      .select("id, name, tier, logo, url, sort_order, published")
      .eq("published", true);
    if (error) console.error("getSponsors: database unavailable:", error.message);
    list = (data ?? [])
      .filter((r) => TIERS.includes(r.tier))
      .map((r) => ({ id: r.id, name: r.name, tier: r.tier, logo: r.logo, url: r.url, order: r.sort_order, published: r.published }));
  }
  // Layout testing only. `process.env.NODE_ENV` is inlined at build time, so
  // this branch and the example file are dropped from production bundles.
  if (process.env.NODE_ENV === "development" && process.env.SPONSORS_EXAMPLE === "1") {
    list = (await import("./sponsors.example")).exampleSponsors;
  }
  return list.filter((s) => s.published).sort((a, b) => a.order - b.order);
});

const allPeople = cache(async (): Promise<Person[]> => {
  const db = publicClient();
  if (!db) return staticPeople;
  const { data, error } = await db
    .from("people")
    .select("id, name, role, org, photo, url, kind, published")
    .eq("published", true)
    .order("sort_order");
  if (error) console.error("getPeople: database unavailable:", error.message);
  return (data ?? []) as Person[];
});

export async function getPeople(kind?: Person["kind"]): Promise<Person[]> {
  return (await allPeople()).filter((p) => p.published && (!kind || p.kind === kind));
}

export async function getSchedule(): Promise<ScheduleItem[]> {
  return schedule;
}
