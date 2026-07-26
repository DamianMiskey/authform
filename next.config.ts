import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Stable as of Next.js 16 (Cache Components) — enables the PPR shell +
  // Suspense dynamic-hole pattern used in register/page.tsx.
  cacheComponents: true,
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
