// lib/cms/sanity-adapter.ts
//
// Example adapter. Not imported by default — uncomment the relevant line
// in lib/cms/index.ts once your Sanity project + schemas exist.
//
// Requires: npm install next-sanity
// Env vars: SANITY_PROJECT_ID, SANITY_DATASET
//
// Expected schema shapes (adjust field names to match your actual
// studio schema — these are illustrative):
//
//   brand { slug, name, logoText, logo (image), primary, primaryForeground,
//           accent, ring, radius, backgroundImage (image) }
//
//   trustBadge { slug, image (optional — omit when using icon), icon
//                (optional string, one of TrustBadgeIcon, e.g.
//                "shield-check"), labels (object or internationalized-array
//                with { en, fr } keys), countries (array of strings),
//                excludeCountries (array of strings) }
//
//   footerLogo — same shape as trustBadge, plus an optional brands (array
//                of Brand ids this logo should show for; omit = all brands)
//
//   license { slug, text (object or internationalized-array with
//             { en, fr } keys), countries (array of strings),
//             excludeCountries (array of strings) }
//
//   registrationFieldRule { field (string, one of RegistrationFieldKey),
//                            status ("required" | "optional" | "hidden"),
//                            countries (array of strings),
//                            excludeCountries (array of strings) }

import { createClient } from "next-sanity";

import type {
  CmsAdapter,
  Brand,
  TrustBadgeRule,
  LicenseRule,
  RegistrationFieldRule,
} from "./types";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2026-01-01",
  useCdn: true,
});

const BRAND_QUERY = /* groq */ `
*[_type == "brand"]{
  "id": slug.current,
  name,
  "logo": {
    "text": logoText,
    "imageUrl": logo.asset->url
  },
  "colors": {
    "primary": primary,
    "primaryForeground": primaryForeground,
    "accent": accent,
    "ring": ring
  },
  radius,
  "backgroundImageUrl": backgroundImage.asset->url
}
`;

const TRUST_BADGE_QUERY = /* groq */ `
*[_type == "trustBadge"]{
  "id": slug.current,
  "imageUrl": image.asset->url,
  icon,
  labels,
  countries,
  excludeCountries
}
`;

const FOOTER_LOGO_QUERY = /* groq */ `
*[_type == "footerLogo"]{
  "id": slug.current,
  "imageUrl": image.asset->url,
  icon,
  labels,
  countries,
  excludeCountries,
  brands
}
`;

const LICENSE_QUERY = /* groq */ `
*[_type == "license"]{
  "id": slug.current,
  text,
  countries,
  excludeCountries
}
`;

const REGISTRATION_FIELD_QUERY = /* groq */ `
*[_type == "registrationFieldRule"]{
  field,
  status,
  countries,
  excludeCountries
}
`;

export const sanityAdapter: CmsAdapter = {
  async getBrands() {
    return client.fetch<Brand[]>(BRAND_QUERY, {}, { next: { revalidate: 300 } });
  },
  async getTrustBadges() {
    return client.fetch<TrustBadgeRule[]>(TRUST_BADGE_QUERY, {}, { next: { revalidate: 300 } });
  },
  async getFooterLogos() {
    return client.fetch<TrustBadgeRule[]>(FOOTER_LOGO_QUERY, {}, { next: { revalidate: 300 } });
  },
  async getLicenses() {
    return client.fetch<LicenseRule[]>(LICENSE_QUERY, {}, { next: { revalidate: 300 } });
  },
  async getRegistrationFields() {
    return client.fetch<RegistrationFieldRule[]>(
      REGISTRATION_FIELD_QUERY,
      {},
      { next: { revalidate: 300 } }
    );
  },
};
