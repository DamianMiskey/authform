import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Set by the cf:* package scripts (and must be set for Cloudflare Workers
// Builds). OpenNext can't yet run Cache Components on workerd, so Workers
// builds turn it off and swap the "use cache" CMS getters for plain ones —
// see lib/cms/getters.uncached.ts. Vercel builds are unaffected.
const isCloudflareWorkers = process.env.CF_WORKERS === "1";

const nextConfig: NextConfig = {
  // Stable as of Next.js 16 (Cache Components) — enables the PPR shell +
  // Suspense dynamic-hole pattern used in register/page.tsx.
  cacheComponents: !isCloudflareWorkers,
  reactCompiler: true,
  turbopack: isCloudflareWorkers
    ? { resolveAlias: { "@/lib/cms/getters": "./lib/cms/getters.uncached.ts" } }
    : undefined,
  experimental: {
    // lucide-react (12 call sites) and date-fns aren't on Next's built-in
    // default-optimized list — without this, every named import pays full
    // barrel-file cost (200-800ms per cold start per the Vercel React
    // best-practices guide).
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default withNextIntl(nextConfig);
