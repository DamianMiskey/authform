// lib/cms/payload-adapter.ts
//
// Example adapter. Not imported by default — uncomment the relevant line
// in lib/cms/index.ts once your Payload collections exist.
//
// Env vars: PAYLOAD_URL (e.g. https://cms.yourdomain.com)
//
// Expected collections (adjust field names to match your actual config):
//
//   Brands: { slug, name, logoText, logo (upload), colors: { primary,
//             primaryForeground, accent, ring }, radius, backgroundImage (upload) }
//
//   TrustBadges: { slug, image (upload), labels: { en, fr }, countries,
//                  excludeCountries }
//
//   FooterLogos: same shape as TrustBadges
//
//   Licenses: { slug, text: { en, fr }, countries, excludeCountries }
//
//   RegistrationFieldRules: { field, status ("required" | "optional" |
//                             "hidden"), countries, excludeCountries }

import type {
  CmsAdapter,
  Brand,
  TrustBadgeRule,
  LicenseRule,
  RegistrationFieldRule,
} from "./types";

const PAYLOAD_URL = process.env.PAYLOAD_URL ?? "http://localhost:3000";

export const payloadAdapter: CmsAdapter = {
  async getBrands() {
    const res = await fetch(`${PAYLOAD_URL}/api/brands?limit=100`, {
      next: { revalidate: 300 }, // CMS content is fine on a short ISR-style revalidation window
    });
    const data = await res.json();

    return data.docs.map(
      (doc: any): Brand => ({
        id: doc.slug,
        name: doc.name,
        logo: { text: doc.logoText, imageUrl: doc.logo?.url },
        colors: doc.colors,
        radius: doc.radius,
        backgroundImageUrl: doc.backgroundImage?.url,
      })
    );
  },

  async getTrustBadges() {
    const res = await fetch(`${PAYLOAD_URL}/api/trust-badges?limit=100`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();

    return data.docs.map(
      (doc: any): TrustBadgeRule => ({
        id: doc.slug,
        imageUrl: doc.image?.url,
        icon: doc.icon,
        labels: doc.labels,
        countries: doc.countries,
        excludeCountries: doc.excludeCountries,
      })
    );
  },

  async getFooterLogos() {
    const res = await fetch(`${PAYLOAD_URL}/api/footer-logos?limit=100`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();

    return data.docs.map(
      (doc: any): TrustBadgeRule => ({
        id: doc.slug,
        imageUrl: doc.image?.url,
        icon: doc.icon,
        labels: doc.labels,
        countries: doc.countries,
        excludeCountries: doc.excludeCountries,
        brands: doc.brands,
      })
    );
  },

  async getLicenses() {
    const res = await fetch(`${PAYLOAD_URL}/api/licenses?limit=100`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();

    return data.docs.map(
      (doc: any): LicenseRule => ({
        id: doc.slug,
        text: doc.text,
        countries: doc.countries,
        excludeCountries: doc.excludeCountries,
      })
    );
  },

  async getRegistrationFields() {
    const res = await fetch(`${PAYLOAD_URL}/api/registration-field-rules?limit=100`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();

    return data.docs.map(
      (doc: any): RegistrationFieldRule => ({
        field: doc.field,
        status: doc.status,
        countries: doc.countries,
        excludeCountries: doc.excludeCountries,
      })
    );
  },
};
