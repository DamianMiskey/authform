"use client";

// components/auth/footer-brand.tsx
//
// The client-only slice of the footer: brand logo (links home) + the
// copyright line. Split out from FooterDynamic (site-footer.tsx) because
// this needs useBrand()'s client context, while FooterDynamic needs
// headers()'s per-request geo — two different render environments that
// can't share a component, let alone a file.

import { BrandLogo } from "@/components/brand/brand-logo";
import { useBrand } from "@/components/brand/brand-provider";
import { useMounted } from "@/hooks/use-mounted";
import { Link } from "@/i18n/navigation";

export function FooterBrand() {
  const { brand } = useBrand();
  return (
    <Link
      href="/"
      aria-label={`${brand.name} home page`}
      className="cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <BrandLogo size="lg" className="pb-0" />
    </Link>
  );
}

export function FooterCopyright() {
  const { brand } = useBrand();
  // Wall-clock read gated behind mount, same as useDobBounds in
  // auth-forms.tsx — reading new Date() during the initial render would
  // otherwise bake a build-time year into the static shell.
  const mounted = useMounted();
  const year = mounted ? new Date().getFullYear() : undefined;

  return (
    <p className="text-xs text-primary/70">
      © {year ?? " "} {brand.name} Casino
    </p>
  );
}
