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
  };
  radius?: string;
  backgroundImageUrl?: string;
}

export interface TrustBadgeRule {
  id: string;
  imageUrl: string;
  /** Translated label per locale, e.g. { en: "...", fr: "..." } */
  labels: Record<string, string>;
  /** ISO 3166-1 alpha-2 codes this badge should show for. Omit = everywhere. */
  countries?: string[];
  /** Takes precedence over `countries` — always hidden for these codes. */
  excludeCountries?: string[];
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

export interface CmsAdapter {
  getBrands(): Promise<Brand[]>;
  getTrustBadges(): Promise<TrustBadgeRule[]>;
  getFooterLogos(): Promise<TrustBadgeRule[]>;
  getLicenses(): Promise<LicenseRule[]>;
}
