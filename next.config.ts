import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Stable as of Next.js 16 (Cache Components) — enables the PPR shell +
  // Suspense dynamic-hole pattern used in register/page.tsx.
  cacheComponents: true,
  reactCompiler: true,
  experimental: {
    // lucide-react (12 call sites) and date-fns aren't on Next's built-in
    // default-optimized list — without this, every named import pays full
    // barrel-file cost (200-800ms per cold start per the Vercel React
    // best-practices guide).
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default withNextIntl(nextConfig);
