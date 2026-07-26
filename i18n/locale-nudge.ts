// i18n/locale-nudge.ts
//
// Data-driven country/region -> locale nudges, so adding a new market
// (e.g. Belgium FR/NL, Switzerland) is a new row here, not a new
// isSomewhere boolean and a copy-pasted branch in proxy.ts.

import { routing } from "./routing";

type Locale = (typeof routing.locales)[number];

interface LocaleNudgeRule {
  country: string;
  /** Omit to nudge the whole country regardless of region. */
  region?: string;
  locale: Locale;
}

const LOCALE_NUDGE_RULES: LocaleNudgeRule[] = [
  {
    // Charter of the French Language — Quebec visitors should land on
    // French by default.
    country: "CA",
    region: "QC",
    locale: "fr",
  },
];

/** First matching rule wins; region-specific rules should precede any
 *  country-wide catch-all for the same country. */
export function resolveLocaleNudge(country: string, region: string): Locale | null {
  const rule = LOCALE_NUDGE_RULES.find(
    (r) => r.country === country && (!r.region || r.region === region)
  );
  return rule?.locale ?? null;
}
