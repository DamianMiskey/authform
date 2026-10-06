// app/[locale]/(auth)/register/page.tsx
//
// PPR shape: static shell (brand chrome) + three Suspense-scoped dynamic
// holes — the form itself (field visibility depends on per-request geo),
// trust badges, and the footer — each needing per-request geo and/or
// locale. Brands are fetched here too, but that's a cacheable CMS fetch,
// not a per-request dynamic call, so it doesn't force this page off the
// shell.
//
// Layout: everything above the footer lives in a centered max-w-xl
// column; the footer itself renders full-bleed (see site-footer.tsx) so
// its brand-tinted band spans the whole viewport width, pinned to the
// bottom via the outer flex column.

import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/auth/language-switcher";
import { RegisterFormData, RegisterFormSkeleton } from "@/components/auth/register-form-data";
import { AuthFooter } from "@/components/auth/site-footer";
import { TrustBadgesDynamic, TrustBadgesSkeleton } from "@/components/auth/trust-badges";
import { BrandProvider } from "@/components/brand/brand-provider";
import { BrandSwitcher } from "@/components/brand/brand-switcher";
import { LivePreviewBrandSync } from "@/components/brand/live-preview-brand-sync";
import { ThemeToggle } from "@/components/theme-toggle";
import { getBrands } from "@/lib/cms";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const brands = await getBrands();

  return (
    <BrandProvider brands={brands}>
      <LivePreviewBrandSync />
      <div data-page="auth" className="flex min-h-screen w-full flex-col bg-background">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 p-6">
          <div className="flex w-full max-w-xl justify-between gap-2">
            <BrandSwitcher />
            <div className="flex gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          <Suspense fallback={<RegisterFormSkeleton />}>
            <RegisterFormData />
          </Suspense>

          <Suspense fallback={<TrustBadgesSkeleton />}>
            <TrustBadgesDynamic />
          </Suspense>
        </div>

        <AuthFooter />
      </div>
    </BrandProvider>
  );
}
