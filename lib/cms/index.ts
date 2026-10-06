// lib/cms/index.ts
//
// THE swap point. Every consumer (BrandProvider's server wrapper,
// TrustBadgesDynamic) calls getBrands()/getTrustBadges() from here —
// never from an adapter file directly. Changing CMS providers later is
// one line in ./adapter.ts, nothing downstream needs to know.
//
// Imported via the "@/lib/cms/getters" alias (not "./getters") so
// next.config.ts can swap in the uncached variant for Cloudflare Workers.
export {
  getBrands,
  getTrustBadges,
  getFooterLogos,
  getLicenses,
  getRegistrationFields,
} from "@/lib/cms/getters";

export type {
  Brand,
  TrustBadgeRule,
  LicenseRule,
  RegistrationFieldRule,
  RegistrationFieldKey,
  CmsAdapter,
} from "./types";
