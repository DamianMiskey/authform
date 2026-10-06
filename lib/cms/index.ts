// lib/cms/index.ts
//
// THE swap point. Every consumer (BrandProvider's server wrapper,
// TrustBadgesDynamic) calls getBrands()/getTrustBadges() from here —
// never from an adapter file directly. Changing CMS providers later is
// this one file, nothing downstream needs to know.

import { cacheLife, cacheTag } from "next/cache";

import { staticAdapter } from "./static-adapter";
// import { sanityAdapter } from "./sanity-adapter";
// import { payloadAdapter } from "./payload-adapter";

// Back on static until Payload is deployed somewhere the build can reach —
// with "use cache" below, CMS data is fetched at build time, and the
// payload adapter's PAYLOAD_URL currently points at localhost.
const adapter = staticAdapter;
// const adapter = sanityAdapter;
// const adapter = payloadAdapter;

// Every getter is a "use cache" function, applied here (not per adapter) so
// whichever adapter is active gets the same treatment. With cacheComponents
// on, a plain fetch — even one with `next: { revalidate }` — counts as
// uncached data, and getBrands() is awaited directly in the register/login
// static shells (outside any Suspense), which fails the prerender.
//
// "minutes" (revalidate 1m, expire 1h) is deliberately the shortest built-in
// profile: anything expiring in under 5 minutes is excluded from prerenders
// and would reintroduce the same error. For instant brand edits, use Payload
// Live Preview (LivePreviewBrandSync) or revalidateTag("cms").
//
// "use cache" also dedupes within a render pass, so react's cache() isn't
// needed on top.
export async function getBrands() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms", "cms:brands");
  return adapter.getBrands();
}

export async function getTrustBadges() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms", "cms:trust-badges");
  return adapter.getTrustBadges();
}

export async function getFooterLogos() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms", "cms:footer-logos");
  return adapter.getFooterLogos();
}

export async function getLicenses() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms", "cms:licenses");
  return adapter.getLicenses();
}

export async function getRegistrationFields() {
  "use cache";
  cacheLife("minutes");
  cacheTag("cms", "cms:registration-fields");
  return adapter.getRegistrationFields();
}

export type {
  Brand,
  TrustBadgeRule,
  LicenseRule,
  RegistrationFieldRule,
  RegistrationFieldKey,
  CmsAdapter,
} from "./types";
