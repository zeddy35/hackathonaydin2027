import type { SiteConfig } from "@/data/types";
import type { Dict } from "./dict";
import type { Locale } from "./i18n";
import { pagePath } from "./routes";

export type PrimaryAction = { href: string; label: string; status: SiteConfig["application"]["status"] };

/**
 * The main call to action depends on the application status:
 * upcoming → participant guide, open → application form, closed → guide (with a closed message).
 * Never label a link "Apply" unless it goes to the form.
 */
export function primaryAction(lang: Locale, site: SiteConfig, d: Dict): PrimaryAction {
  const status = site.application.status;
  if (status === "open") return { href: pagePath(lang, site.application.formPage), label: d.cta.apply, status };
  return { href: pagePath(lang, "guide"), label: d.cta.info, status };
}
