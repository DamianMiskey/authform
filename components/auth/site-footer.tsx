// components/auth/site-footer.tsx
//
// Same geo-resolution pattern as trust-badges.tsx: reads the
// x-user-country header proxy.ts sets, then picks the footer logos and
// the license notice for that jurisdiction. Kept as a separate component
// (rather than folded into TrustBadgesDynamic) because these are a
// distinct content set — footer-level compliance logos and licensing
// text, not the near-CTA trust badges.

import { headers } from "next/headers";
import Image from "next/image";
import { getLocale } from "next-intl/server";

import { getFooterLogos, getLicenses } from "@/lib/cms";
import { resolveTrustBadges, resolveBadgeLabel, resolveLicense, resolveLicenseText } from "@/lib/trust-badges";

export async function FooterDynamic() {
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
    <footer className="flex w-full max-w-sm flex-col items-center gap-3 border-t pt-4 text-center">
      {logos.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          {logos.map((logo) => (
            <Image
              key={logo.id}
              src={logo.imageUrl}
              alt={resolveBadgeLabel(logo, locale)}
              width={120}
              height={32}
              unoptimized
              className="h-8 w-auto opacity-80"
            />
          ))}
        </div>
      )}
      {license && (
        <p className="text-xs text-muted-foreground">{resolveLicenseText(license, locale)}</p>
      )}
    </footer>
  );
}

export function FooterSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-3 border-t pt-4">
      <div className="h-8 w-40 rounded-md bg-slate-200/70 animate-pulse" />
      <div className="h-3 w-56 rounded-md bg-slate-200/70 animate-pulse" />
    </div>
  );
}
