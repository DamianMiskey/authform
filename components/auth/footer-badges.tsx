"use client";

// components/auth/footer-badges.tsx
//
// Renders the country-resolved footer logos (from FooterDynamic, server)
// filtered down by the *active* brand. Split out because the selected
// brand is client-only state (BrandProvider's useState) — the server has
// no way to know it, only the geo header — so this second filtering pass
// has to happen here, not in FooterDynamic.

import { TrustBadgeMark } from "@/components/auth/trust-badge-mark";
import { useBrand } from "@/components/brand/brand-provider";
import type { TrustBadgeRule } from "@/lib/cms/types";
import { resolveBrandScoped } from "@/lib/trust-badges";

export function FooterBadges({
  logos,
  locale,
}: Readonly<{ logos: TrustBadgeRule[]; locale: string }>) {
  const { brand } = useBrand();
  const scoped = resolveBrandScoped(brand.id, logos);

  if (scoped.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {scoped.map((logo) => (
        <TrustBadgeMark key={logo.id} badge={logo} locale={locale} />
      ))}
    </div>
  );
}
