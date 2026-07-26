// proxy.ts (Next.js 16 — replaces the old middleware.ts convention)
//
// Three jobs, in order:
//   1. Resolve geo (country/region) once, up front.
//   2. Geo-based locale nudge (see i18n/locale-nudge.ts for the actual
//      country/region -> locale rules, e.g. Quebec -> French under the
//      Charter of the French Language) — but only on first visit. An
//      explicit NEXT_LOCALE cookie (manual switch, or a later visit)
//      always wins over this guess.
//   3. next-intl's own locale routing runs for everyone else.

import { geolocation } from "@vercel/functions";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { resolveLocaleNudge } from "./i18n/locale-nudge";
import { routing } from "./i18n/routing";

const intlProxy = createIntlMiddleware(routing);

// Lets QA/local dev force a jurisdiction with ?country=nz instead of
// redeploying with a different env var. Disabled on production so a real
// visitor can never spoof their own geolocation via the URL.
const ALLOW_COUNTRY_OVERRIDE = process.env.VERCEL_ENV !== "production";

export default function proxy(request: NextRequest) {
  const geo = geolocation(request);
  const countryOverride = ALLOW_COUNTRY_OVERRIDE
    ? request.nextUrl.searchParams.get("country")?.toUpperCase()
    : null;

  // Priority: manual override (dev/preview only) > Cloudflare's real
  // header (the authoritative source once CF sits in front, live) >
  // Vercel's own geolocation (keeps this working pre-Cloudflare) > the
  // old dev env var > a hard default.
  const country =
    countryOverride ||
    request.headers.get("cf-ipcountry") ||
    geo.country ||
    process.env.NEXT_PUBLIC_DEV_GEO_COUNTRY ||
    "US";
  const region = geo.countryRegion ?? "";

  const nudgedLocale = resolveLocaleNudge(country, region);
  const hasExplicitLocaleChoice = request.cookies.has("NEXT_LOCALE");
  const alreadyOnLocalizedPath = routing.locales.some((l) =>
    request.nextUrl.pathname.startsWith(`/${l}`)
  );

  if (nudgedLocale && !hasExplicitLocaleChoice && !alreadyOnLocalizedPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${nudgedLocale}${url.pathname === "/" ? "" : url.pathname}`;

    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.cookies.set("NEXT_LOCALE", nudgedLocale);
    redirectResponse.headers.set("x-user-country", country);
    redirectResponse.headers.set("x-user-region", region);
    return redirectResponse;
  }

  const response = intlProxy(request);
  response.headers.set("x-user-country", country);
  response.headers.set("x-user-region", region);
  return response;
}

export const config = {
  matcher: ["/", "/(fr|en)/:path*", "/((?!_next|api|.*\\..*).*)"],
};
