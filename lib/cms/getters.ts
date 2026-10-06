// lib/cms/getters.ts
//
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
//
// Cloudflare Workers builds (CF_WORKERS=1) swap this module for
// getters.uncached.ts via turbopack.resolveAlias in next.config.ts — keep the
// two files' exports in sync.

import { cacheLife, cacheTag } from "next/cache";

import { adapter } from "./adapter";

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
