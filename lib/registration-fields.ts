// lib/registration-fields.ts
//
// Pure functions only — no fetching here, same split as lib/trust-badges.ts.
// Data comes from lib/cms; this file just decides which register-form
// fields are required/optional/hidden for a given country.

import type { RegistrationFieldKey, RegistrationFieldRule } from "./cms/types";

export type FieldStatus = "required" | "optional" | "hidden";

// A field with no matching rule keeps its baseline behavior from the
// schema/form as written — every toggleable field defaults to required
// except middleName, which has always been optional.
const DEFAULT_STATUS: Record<RegistrationFieldKey, FieldStatus> = {
  middleName: "optional",
  occupationIndustry: "required",
  occupationJobTitle: "required",
  politicallyExposedPerson: "required",
};

function matchesCountry(
  country: string,
  rule: { countries?: string[]; excludeCountries?: string[] }
): boolean {
  if (rule.excludeCountries?.includes(country)) return false;
  if (rule.countries && !rule.countries.includes(country)) return false;
  return true;
}

export type FieldStatusMap = Record<RegistrationFieldKey, FieldStatus>;

// First matching rule wins for a given field — static-adapter.ts orders
// rules so a country-specific override comes before its fallback.
export function resolveFieldStatus(
  country: string,
  rules: RegistrationFieldRule[]
): FieldStatusMap {
  const result = { ...DEFAULT_STATUS };
  for (const key of Object.keys(DEFAULT_STATUS) as RegistrationFieldKey[]) {
    const match = rules.find((r) => r.field === key && matchesCountry(country, r));
    if (match) result[key] = match.status;
  }
  return result;
}
