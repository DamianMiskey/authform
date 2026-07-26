# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A multi-brand, geo-aware, i18n, themeable auth registration flow built on Next.js 16 App Router (Cache Components / PPR). It's a self-contained POC — the only real page is `/[locale]/register` (root `/` just redirects there).

## Commands

```bash
npm run dev     # next dev
npm run build   # next build
npm run start   # next start
npm run lint    # eslint .
```

There is no test suite configured in this repo (no test script, no Jest/Vitest config).

## Architecture

### Request flow: `proxy.ts`

Next 16's rename of `middleware.ts`. Three jobs in order:
1. Resolves country via a priority chain: `?country=` query override (dev/preview only — disabled when `VERCEL_ENV === "production"` so a real visitor can't spoof their own jurisdiction) → `cf-ipcountry` header (the real source once Cloudflare sits in front) → `@vercel/functions`' `geolocation()` (works today, pre-Cloudflare) → `NEXT_PUBLIC_DEV_GEO_COUNTRY` env var → `"US"`.
2. Quebec locale nudge: first-time CA-QC visitors get redirected to `/fr` (Charter of the French Language), unless they already have a `NEXT_LOCALE` cookie (explicit choice always wins). This region check still relies on Vercel's `geo.countryRegion` — Cloudflare only sends region via `cf-region-code` if "Add visitor location headers" is explicitly enabled, so this nudge needs revisiting if/when Vercel geolocation is dropped in favor of Cloudflare-only.
3. Delegates to `next-intl`'s own locale routing for everyone else.
4. Sets `x-user-country` / `x-user-region` response headers — this is how server components downstream (trust badges, footer) read geo without each needing their own resolution logic.

### CMS abstraction: `lib/cms/`

`lib/cms/index.ts` is **the** swap point. Every consumer (`BrandProvider`'s server wrapper, `TrustBadgesDynamic`, `FooterDynamic`) calls `getBrands()` / `getTrustBadges()` / `getFooterLogos()` / `getLicenses()` from `lib/cms`, never from an adapter file directly. Changing CMS providers is a one-line change here.

- `types.ts` defines the `CmsAdapter` contract — **all three adapters (`static-adapter.ts`, `sanity-adapter.ts`, `payload-adapter.ts`) must implement every method on this interface**, even though only `static-adapter.ts` is wired in by default and the other two are inert reference examples. Adding a field/method to the contract means touching all three files or the build breaks (the example adapters are still type-checked, `sanity-adapter.ts` is excluded from `tsconfig.json`'s `include` because `next-sanity` isn't installed, but it's still checked by the IDE's language service).
- `static-adapter.ts` is the zero-dependency default — works with no CMS configured.
- Geo-targeted content (trust badges, footer logos, license text) uses the same shape: `{ countries?, excludeCountries? }` on each rule, resolved by pure functions in `lib/trust-badges.ts` (`matchesCountry`, `resolveTrustBadges`, `resolveLicense`, etc.) against the `x-user-country` header. `excludeCountries` takes precedence over `countries`; a rule with neither matches everywhere. This is the pattern to follow for any new geo-targeted content — add the type to `types.ts`, mock data to `static-adapter.ts`, a resolver to `lib/trust-badges.ts`, and a Suspense-wrapped server component to render it.

### Brand system

`BrandProvider` (`components/brand/brand-provider.tsx`) is a client context that picks a `Brand` (from `getBrands()`) and injects `--brand-primary` / `--brand-accent` / `--brand-ring` / `--brand-radius` as inline CSS vars on a wrapping `div[data-brand]`. `globals.css` reads these into Tailwind v4's `@theme inline` block. Light/dark surface tokens (`--background`, `--card`, `--popover`, `--border`, `--muted`) are separate from brand color and live directly in `:root` / `.dark`.

**Gotcha:** there is no `tailwind.config.js` (Tailwind v4, CSS-first config). Any `bg-*`/`text-*` utility a shadcn component uses (e.g. `bg-popover`, `text-popover-foreground`) only resolves if the corresponding `--color-*` is registered in the `@theme inline` block in `globals.css` AND the underlying `--popover`/`--popover-foreground` HSL vars exist in `:root`/`.dark`. Missing either silently produces a transparent/no-op class, not a build error — this bit us once already (popovers/dropdowns rendering with no background).

### Cache Components / PPR

`next.config.ts` sets `cacheComponents: true`. `register/page.tsx` is a static shell; anything that needs `headers()`/`cookies()` (geo-dependent content) is pulled into its own async Server Component wrapped in `<Suspense>` so it doesn't force the whole page dynamic — see `TrustBadgesDynamic`/`FooterDynamic` in `components/auth/`. Client components that need "now" (e.g. disabling future dates in the date picker) must defer reading `new Date()` to a `useEffect`, never during the initial render — reading wall-clock time synchronously breaks the static shell.

### i18n

`next-intl`, locale-prefixed routes (`/en`, `/fr`), config in `i18n/routing.ts` / `request.ts` / `navigation.ts`. `messages/en.json` and `messages/fr.json` hold **UI chrome only** (labels, buttons, validation strings) — CMS-driven content (trust badge labels, footer logos, license text) carries its own per-locale text directly on the CMS record (`labels: { en, fr }` / `text: { en, fr }`), not in the messages files. Don't conflate the two when adding new copy.

### Forms

`components/auth/auth-forms.tsx` exports `NormalRegisterForm` and `StepperRegisterForm` (react-hook-form + zod, shared `registerSchema`). `RegisterFormToggle` (`components/auth/register-form-toggle.tsx`) is the client component that switches between them.

### Import convention

Every cross-folder import uses the `@/...` alias — never a relative path reaching into a sibling route folder (e.g. `register/`). If a new auth page (login, forgot-password) needs trust badges or the language switcher, import via `@/components/auth/...`, not a relative path into `register/`.

### shadcn/ui

`components.json` config (`style: "radix-vega"`, `baseColor: "neutral"`, css vars in `app/[locale]/globals.css`). Components live in `components/ui/`, added via `npx shadcn@latest add <component>`. `package.deps.json` lists the shadcn components this feature needs if bootstrapping fresh.
