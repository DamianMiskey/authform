// app/[locale]/page.tsx
//
// Handles "/" and "/en" / "/fr". Without this, proxy.ts redirects the bare
// root to the default locale prefix, but there's nothing for Next.js to
// render there — hence a 404. Swap the redirect target for a real landing
// page once you have one.

import { redirect } from "next/navigation";

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/register`);
}
