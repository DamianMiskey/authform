// components/auth/site-footer.tsx
//
// AuthFooter is the full-width, brand-tinted (bg-footer, sourced from
// Brand.colors.footerBackground — falls back to accent if unset) band
// shared by every auth page — always rendered (logo + copyright never
// depend on per-request data), with the badges/license row Suspense-scoped
// inside it since that part alone needs the x-user-country header.
// Composition: FooterBrand (client, useBrand()) -> FooterDynamic (server,
// geo) -> FooterCopyright (client, useBrand() + mounted-gated year).
//
// FooterDynamic follows the same geo-resolution pattern as
// trust-badges.tsx: reads the x-user-country header proxy.ts sets, then
// picks the footer logos and license notice for that jurisdiction.

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";
import { Suspense } from "react";

import { FooterBadges } from "@/components/auth/footer-badges";
import { FooterBrand, FooterCopyright } from "@/components/auth/footer-brand";
import { getFooterLogos, getLicenses } from "@/lib/cms";
import { resolveTrustBadges, resolveLicense, resolveLicenseText } from "@/lib/trust-badges";

export function AuthFooter() {
  return (
    <footer className="w-full bg-footer">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-8 text-center">
        <FooterBrand />
        <Suspense fallback={<FooterBadgesSkeleton />}>
          <FooterDynamic />
        </Suspense>
        <FooterCopyright />
      </div>
    </footer>
  );
}

async function FooterDynamic() {
  const [headersList, locale, allLogos, allLicenses] = await Promise.all([
    headers(),
    getLocale(),
    getFooterLogos(),
    getLicenses(),
  ]);

  const country = headersList.get("x-user-country") ?? "US";
  const logos = resolveTrustBadges(country, allLogos);
  const license = resolveLicense(country, allLicenses);

  if (logos.length === 0 && !license) return null;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <FooterBadges logos={logos} locale={locale} />
      {license && (
        <p className="text-xs text-primary/80">{resolveLicenseText(license, locale)}</p>
      )}
    </div>
  );
}

function FooterBadgesSkeleton() {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="h-8 w-40 rounded-md bg-black/10 animate-pulse" />
      <div className="h-3 w-56 rounded-md bg-black/10 animate-pulse" />
    </div>
  );
}
