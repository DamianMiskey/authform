// components/auth/register-form-data.tsx
//
// Same Suspense-scoped pattern as TrustBadgesDynamic/FooterDynamic: reads
// the x-user-country header proxy.ts sets, resolves it into a per-field
// required/optional/hidden map via lib/registration-fields, then hands
// that off to the client-side RegisterFormToggle. Kept out of the static
// shell (register/page.tsx wraps this in its own <Suspense>) so reading
// headers() here doesn't force the whole page dynamic.

import { headers } from "next/headers";

import { RegisterFormToggle } from "@/components/auth/register-form-toggle";
import { getRegistrationFields } from "@/lib/cms";
import { resolveFieldStatus } from "@/lib/registration-fields";

export async function RegisterFormData() {
  const [headersList, rules] = await Promise.all([
    headers(),
    getRegistrationFields(),
  ]);

  const country = headersList.get("x-user-country") ?? "US";
  const fieldStatus = resolveFieldStatus(country, rules);

  return <RegisterFormToggle fieldStatus={fieldStatus} />;
}

export function RegisterFormSkeleton() {
  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="h-8 w-full rounded-md bg-slate-200/70 animate-pulse" />
      <div className="h-[520px] w-full rounded-md bg-slate-200/70 animate-pulse" />
    </div>
  );
}
