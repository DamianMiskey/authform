// components/auth/trust-badge-mark.tsx
//
// Renders one badge, however it's provisioned: a real logo (imageUrl) or
// a Lucide icon (icon) for badges that don't have — or don't need — an
// actual image asset. Pure/stateless, no "use client" needed, so it works
// from both the server-rendered near-CTA badges (trust-badges.tsx) and
// the client-rendered footer badges (footer-badges.tsx) alike.

import { BadgeCheck, ShieldCheck, type LucideIcon } from "lucide-react";
import Image from "next/image";

import type { TrustBadgeIcon, TrustBadgeRule } from "@/lib/cms/types";
import { resolveBadgeLabel } from "@/lib/trust-badges";

const ICONS: Record<TrustBadgeIcon, LucideIcon> = {
  "shield-check": ShieldCheck,
  "badge-check": BadgeCheck,
};

export function TrustBadgeMark({
  badge,
  locale,
}: Readonly<{ badge: TrustBadgeRule; locale: string }>) {
  const label = resolveBadgeLabel(badge, locale);

  if (badge.icon) {
    const Icon = ICONS[badge.icon];
    return (
      <span
        title={label}
        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground opacity-80"
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
    );
  }

  // `fill` + object-contain in a fixed-size box, rather than explicit
  // width/height props — these logos come from third parties with wildly
  // different native aspect ratios (a payment icon vs. a certification
  // seal), so any single width/height pair passed here would mismatch
  // most of them and trigger Next's aspect-ratio console warning. `fill`
  // sidesteps that: it fits within the box and preserves its own ratio,
  // whatever that is.
  return (
    <div className="relative h-8 w-20 shrink-0 opacity-80">
      <Image
        src={badge.imageUrl!}
        alt={label}
        fill
        unoptimized
        sizes="80px"
        className="object-contain"
      />
    </div>
  );
}
