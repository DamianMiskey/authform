// lib/cms/getters.uncached.ts
//
// Cloudflare Workers stand-in for getters.ts, aliased in by next.config.ts
// when CF_WORKERS=1. Workers builds run with cacheComponents off — OpenNext
// can't yet run Cache Components on workerd (opennextjs-cloudflare PR #1318),
// it throws "getCloudflareContext has been called in sync mode" at request
// time — and "use cache" fails to compile without cacheComponents. So these
// are plain pass-throughs; every request renders dynamically.
//
// Must export exactly the same names as getters.ts.

import { adapter } from "./adapter";

export const getBrands = () => adapter.getBrands();
export const getTrustBadges = () => adapter.getTrustBadges();
export const getFooterLogos = () => adapter.getFooterLogos();
export const getLicenses = () => adapter.getLicenses();
export const getRegistrationFields = () => adapter.getRegistrationFields();
