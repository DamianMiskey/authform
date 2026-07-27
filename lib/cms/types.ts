// lib/cms/types.ts
//
// These shapes are the contract between the app and whatever CMS is
// behind it. Sanity, Payload, or a static fallback all just need to
// return data matching these — nothing else in the app cares which one
// is actually providing it.

export interface Brand {
  id: string;
  name: string;
  logo: {
    text: string;
    imageUrl?: string;
  };
  colors: {
    primary: string; // "H S% L%" — no hsl() wrapper
    primaryForeground: string;
    accent: string;
    ring: string;
    /** Footer band background. Optional — falls back to `accent` so
     *  existing brands don't need updating. Kept separate from `accent`
     *  because accent also drives Select/DropdownMenu hover states;
     *  without this a brand couldn't have a dark footer without every
     *  dropdown hover going dark too. */
    footerBackground?: string;
  };
  radius?: string;
  backgroundImageUrl?: string;
}

/** Lucide icon name for badges rendered without a real logo asset —
 *  see TrustBadgeMark's ICONS map for the actual component behind each. */
export type TrustBadgeIcon = "shield-check" | "badge-check";

export interface TrustBadgeRule {
  id: string;
  /** Required unless `icon` is set. */
  imageUrl?: string;
  /** Renders as a Lucide icon instead of `imageUrl` when set. */
  icon?: TrustBadgeIcon;
  /** Translated label per locale, e.g. { en: "...", fr: "..." } */
  labels: Record<string, string>;
  /** ISO 3166-1 alpha-2 codes this badge should show for. Omit = everywhere. */
  countries?: string[];
  /** Takes precedence over `countries` — always hidden for these codes. */
  excludeCountries?: string[];
  /** Brand ids this badge should show for. Omit = every brand. Unlike
   *  countries (resolved server-side from the geo header), this is
   *  resolved client-side since the active brand is client-only state
   *  (BrandProvider) — see FooterBadges. */
  brands?: string[];
}

export interface LicenseRule {
  id: string;
  /** Translated license text per locale, e.g. { en: "...", fr: "..." } */
  text: Record<string, string>;
  /** ISO 3166-1 alpha-2 codes this license applies to. Omit = everywhere. */
  countries?: string[];
  /** Takes precedence over `countries` — always hidden for these codes. */
  excludeCountries?: string[];
}

// Fields the register form can conditionally show/hide or make optional
// per jurisdiction. Keep this list to fields that actually vary by market —
// account/security fields (username, password, terms) are never toggled.
export type RegistrationFieldKey =
  | "middleName"
  | "occupationIndustry"
  | "occupationJobTitle"
  | "politicallyExposedPerson";

export interface RegistrationFieldRule {
  field: RegistrationFieldKey;
  status: "required" | "optional" | "hidden";
  /** ISO 3166-1 alpha-2 codes this status applies to. Omit = everywhere. */
  countries?: string[];
  /** Takes precedence over `countries` — always excluded for these codes. */
  excludeCountries?: string[];
}

export interface CmsAdapter {
  getBrands(): Promise<Brand[]>;
  getTrustBadges(): Promise<TrustBadgeRule[]>;
  getFooterLogos(): Promise<TrustBadgeRule[]>;
  getLicenses(): Promise<LicenseRule[]>;
  getRegistrationFields(): Promise<RegistrationFieldRule[]>;
}
