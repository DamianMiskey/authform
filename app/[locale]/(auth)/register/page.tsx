// app/[locale]/(auth)/register/page.tsx
//
// PPR shape: static shell (form, brand chrome) + one Suspense-scoped
// dynamic hole (trust badges, which need per-request geo + locale).
// Brands are fetched here too, but that's a cacheable CMS fetch, not a
// per-request dynamic call, so it doesn't force this page off the shell.

import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/auth/language-switcher";
import { RegisterFormToggle } from "@/components/auth/register-form-toggle";
import { FooterDynamic, FooterSkeleton } from "@/components/auth/site-footer";
import { TrustBadgesDynamic, TrustBadgesSkeleton } from "@/components/auth/trust-badges";
import { BrandProvider } from "@/components/brand/brand-provider";
import { BrandSwitcher } from "@/components/brand/brand-switcher";
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
      <div
        data-page="auth"
        className="min-h-screen w-full bg-background flex flex-col items-center justify-center gap-4 p-6"
      >
        <div className="w-full max-w-sm flex justify-between gap-2">
          <BrandSwitcher />
          <div className="flex gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        <RegisterFormToggle />

        <Suspense fallback={<TrustBadgesSkeleton />}>
          <TrustBadgesDynamic />
        </Suspense>

        <Suspense fallback={<FooterSkeleton />}>
          <FooterDynamic />
        </Suspense>
      </div>
    </BrandProvider>
  );
}
