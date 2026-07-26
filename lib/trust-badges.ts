// lib/trust-badges.ts
//
// Pure functions only — no fetching here. Data comes from lib/cms;
// this file just decides (a) which badges are visible for a country and
// (b) what they say in a given locale. Keeping this separate from
// lib/cms means the CMS can be swapped without touching this logic at all.

import type { TrustBadgeRule, LicenseRule } from "./cms/types";

function matchesCountry(
  country: string,
  rule: { countries?: string[]; excludeCountries?: string[] }
): boolean {
  if (rule.excludeCountries?.includes(country)) return false;
  if (rule.countries && !rule.countries.includes(country)) return false;
  return true;
}

export function resolveTrustBadges(country: string, badges: TrustBadgeRule[]): TrustBadgeRule[] {
  return badges.filter((badge) => matchesCountry(country, badge));
}

export function resolveBadgeLabel(badge: TrustBadgeRule, locale: string): string {
  return badge.labels[locale] ?? badge.labels.en;
}

// Licenses are mutually exclusive per jurisdiction, so this resolves to at
// most one rule — unlike badges, which can stack.
export function resolveLicense(country: string, licenses: LicenseRule[]): LicenseRule | undefined {
  return licenses.find((license) => matchesCountry(country, license));
}

export function resolveLicenseText(license: LicenseRule, locale: string): string {
  return license.text[locale] ?? license.text.en;
}
