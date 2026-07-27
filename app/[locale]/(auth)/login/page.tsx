// app/[locale]/(auth)/login/page.tsx
//
// Same shell as register/page.tsx: brand chrome in the static part, trust
// badges + footer as their own Suspense-scoped geo/locale reads. The form
// itself doesn't need CMS-resolved field rules (login has no jurisdiction-
// varying fields), so unlike register it renders directly in the shell —
// no per-request data, no Suspense boundary needed for it.

import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { LanguageSwitcher } from "@/components/auth/language-switcher";
import { LoginForm } from "@/components/auth/login-form";
import { AuthFooter } from "@/components/auth/site-footer";
import { TrustBadgesDynamic, TrustBadgesSkeleton } from "@/components/auth/trust-badges";
import { BrandProvider } from "@/components/brand/brand-provider";
import { BrandSwitcher } from "@/components/brand/brand-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { getBrands } from "@/lib/cms";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const brands = await getBrands();

  return (
    <BrandProvider brands={brands}>
      <div data-page="auth" className="flex min-h-screen w-full flex-col bg-background">
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 p-6">
          <div className="flex w-full max-w-xl justify-between gap-2">
            <BrandSwitcher />
            <div className="flex gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          <LoginForm />

          <Suspense fallback={<TrustBadgesSkeleton />}>
            <TrustBadgesDynamic />
          </Suspense>
        </div>

        <AuthFooter />
      </div>
    </BrandProvider>
  );
}
