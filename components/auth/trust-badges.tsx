// components/auth/trust-badges.tsx
//
// Lives here (not inside app/[locale]/(auth)/register/) so any auth page
// — register, login, whatever gets added next — imports this the same
// way: "@/components/auth/trust-badges". No relative paths reaching
// across route folders.

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { TrustBadgeMark } from "@/components/auth/trust-badge-mark";
import { getTrustBadges } from "@/lib/cms";
import { resolveTrustBadges } from "@/lib/trust-badges";

export async function TrustBadgesDynamic() {
  const [headersList, locale, allBadges] = await Promise.all([
    headers(),
    getLocale(),
    getTrustBadges(),
  ]);

  const country = headersList.get("x-user-country") ?? "US";
  const badges = resolveTrustBadges(country, allBadges);

  if (badges.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {badges.map((b) => (
        <TrustBadgeMark key={b.id} badge={b} locale={locale} />
      ))}
    </div>
  );
}

export function TrustBadgesSkeleton() {
  return <div className="h-8 w-48 rounded-md bg-slate-200/70 animate-pulse mt-4" />;
}
