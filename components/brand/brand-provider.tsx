"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import type { Brand } from "@/lib/cms/types";

interface BrandContextValue {
  brand: Brand;
  setBrandId: (id: string) => void;
  brands: Brand[];
  /** Live Preview support (see live-preview-brand-sync.tsx): lets a nested
   *  client component push CMS edits for the currently-previewed brand in
   *  without a refetch. No-op outside Payload's Live Preview iframe. */
  setLivePreviewOverride: (brand: Brand | null) => void;
}

const BrandContext = createContext<BrandContextValue | null>(null);

export function useBrand() {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error("useBrand must be used within a BrandProvider");
  return ctx;
}

export function BrandProvider({
  children,
  brands,
  initialBrandId,
}: Readonly<{
  children: ReactNode;
  /** Fetched server-side via getBrands() from lib/cms — this component
   *  never fetches its own data, so it doesn't care whether that came
   *  from Sanity, Payload, or the static fallback. */
  brands: Brand[];
  initialBrandId?: string;
}>) {
  const [brandId, setBrandId] = useState(initialBrandId ?? brands[0]?.id);
  const [livePreviewOverride, setLivePreviewOverride] = useState<Brand | null>(null);

  const brand = useMemo(() => {
    if (livePreviewOverride && livePreviewOverride.id === brandId) {
      return livePreviewOverride;
    }
    return brands.find((b) => b.id === brandId) ?? brands[0];
  }, [brandId, brands, livePreviewOverride]);

  if (!brand) {
    throw new Error("BrandProvider received an empty brands array");
  }

  const cssVars = {
    "--brand-primary": brand.colors.primary,
    "--brand-primary-foreground": brand.colors.primaryForeground,
    "--brand-accent": brand.colors.accent,
    "--brand-ring": brand.colors.ring,
    // Falls back to accent so brands that don't set this keep today's look.
    "--brand-footer-bg": brand.colors.footerBackground ?? brand.colors.accent,
    ...(brand.radius ? { "--brand-radius": brand.radius } : {}),
  } as React.CSSProperties;

  return (
    <BrandContext.Provider value={{ brand, setBrandId, brands, setLivePreviewOverride }}>
      <div data-brand={brand.id} style={cssVars}>
        {children}
      </div>
    </BrandContext.Provider>
  );
}
