// lib/cms/index.ts
//
// THE swap point. Every consumer (BrandProvider's server wrapper,
// TrustBadgesDynamic) calls getBrands()/getTrustBadges() from here —
// never from an adapter file directly. Changing CMS providers later is
// this one file, nothing downstream needs to know.

import { cache } from "react";

import { staticAdapter } from "./static-adapter";
// import { sanityAdapter } from "./sanity-adapter";
// import { payloadAdapter } from "./payload-adapter";

const adapter = staticAdapter;
// const adapter = sanityAdapter;
// const adapter = payloadAdapter;

// react's cache() dedupes this within a single render pass — if both the
// layout and the page happen to ask for brands on the same request, it
// only actually fetches once.
export const getBrands = cache(() => adapter.getBrands());
export const getTrustBadges = cache(() => adapter.getTrustBadges());
export const getFooterLogos = cache(() => adapter.getFooterLogos());
export const getLicenses = cache(() => adapter.getLicenses());

export type { Brand, TrustBadgeRule, LicenseRule, CmsAdapter } from "./types";
