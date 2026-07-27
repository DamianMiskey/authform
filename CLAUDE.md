# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A multi-brand, geo-aware, i18n, themeable auth flow built on Next.js 16 App Router (Cache Components / PPR). Two real pages — `/[locale]/register` and `/[locale]/login` (root `/` redirects to register) — plus a "MinReg" quick-signup mode on the register page (first name + email only, intended to eventually POST to a PAM/Player Account Management endpoint). It's a self-contained POC: no real backend, every submit is a simulated `toast.success` + a `SuccessCard`.

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
2. Quebec locale nudge (`i18n/locale-nudge.ts`): first-time CA-QC visitors get redirected to `/fr` (Charter of the French Language), unless they already have a `NEXT_LOCALE` cookie (explicit choice always wins). This region check still relies on Vercel's `geo.countryRegion` — Cloudflare only sends region via `cf-region-code` if "Add visitor location headers" is explicitly enabled, so this nudge needs revisiting if/when Vercel geolocation is dropped in favor of Cloudflare-only.
3. Delegates to `next-intl`'s own locale routing for everyone else.
4. Sets `x-user-country` / `x-user-region` response headers — this is how server components downstream (trust badges, footer, registration field visibility) read geo without each needing their own resolution logic.

### CMS abstraction: `lib/cms/`

`lib/cms/index.ts` is **the** swap point. Every consumer calls `getBrands()` / `getTrustBadges()` / `getFooterLogos()` / `getLicenses()` / `getRegistrationFields()` from `lib/cms`, never from an adapter file directly. Changing CMS providers is a one-line change here.

- `types.ts` defines the `CmsAdapter` contract — **all three adapters (`static-adapter.ts`, `sanity-adapter.ts`, `payload-adapter.ts`) must implement every method on this interface**, even though only `static-adapter.ts` is wired in by default and the other two are inert reference examples. Adding a field/method to the contract means touching all three files or the build breaks (the example adapters are still type-checked; `sanity-adapter.ts` is excluded from `tsconfig.json`'s `include` because `next-sanity` isn't installed, but it's still checked by the IDE's language service).
- `static-adapter.ts` is the zero-dependency default — works with no CMS configured. It also hosts a **temporary demo-only brand** (`vegaspalms-demo`) with real colors/logo/footer badges hotlinked from a live casino site's Sanity CDN, purely to preview theming against a real brand — see the comments on that entry before touching it; it isn't meant to ship.
- `TrustBadgeRule` (used for both `getTrustBadges()` and `getFooterLogos()`) supports two independent scoping mechanisms that AND together: `countries`/`excludeCountries` (geo, resolved server-side in `lib/trust-badges.ts`) and `brands` (resolved client-side — see "Trust badges & footer" below). A badge can render as an image (`imageUrl`) or a Lucide icon (`icon`, one of `TrustBadgeIcon` — used when there's no real logo asset, e.g. `ssl-secure`); `TrustBadgeMark` picks whichever is set.
- Geo-targeted content (trust badges, footer logos, license text) uses the shape `{ countries?, excludeCountries? }` on each rule, resolved by pure functions in `lib/trust-badges.ts` (`matchesCountry`, `resolveTrustBadges`, `resolveLicense`, `resolveBrandScoped`, etc.) against the `x-user-country` header. `excludeCountries` takes precedence over `countries`; a rule with neither matches everywhere. This is the pattern to follow for any new **geo**-targeted content — add the type to `types.ts`, mock data to `static-adapter.ts`, a resolver to `lib/trust-badges.ts`, and a Suspense-wrapped server component to render it. (Not every conditional field belongs in this system — see the next section.)

### Registration field visibility: geo-driven vs. form-reactive

Two different mechanisms control which register-form fields show, and it matters which one a new field should use:

- **Geo-driven** (`lib/registration-fields.ts` + `RegistrationFieldRule` in `lib/cms/types.ts`): for fields whose requirement is a genuine jurisdiction/compliance question the visitor never directly answers — `middleName`, `occupationIndustry`, `occupationJobTitle`, `politicallyExposedPerson`. Resolved once server-side in `RegisterFormData` (`components/auth/register-form-data.tsx`) from `x-user-country`, passed down as a `FieldStatusMap` prop, consumed via `buildRegisterSchema(fieldStatus)`'s `superRefine` in `lib/validations.ts`.
- **Form-reactive**: for fields whose relevance is directly implied by another field the user *just picked* — currently just `stateProvince` (Albania-only content; shown/required exactly when the user selects Albania in the Country field). This is **not** in the CMS/geo system — it's a plain `useWatch({ control, name: "country" })` in `ContactFields` (`components/auth/auth-forms.tsx`) plus a dedicated `.refine((data) => data.country !== "AL" || !!data.stateProvince, ...)` in `buildRegisterSchema`. This used to be geo-driven (CA/US), and that was a recurring source of confusion — the one signal visible to the user (the Country dropdown) had no effect on it, while an invisible geo header did. If a new field's visibility should track something the user picks in the form itself, follow this pattern, not the geo one.

### Brand system

`BrandProvider` (`components/brand/brand-provider.tsx`) is a client context that picks a `Brand` (from `getBrands()`) and injects `--brand-primary` / `--brand-primary-foreground` / `--brand-accent` / `--brand-ring` / `--brand-footer-bg` / `--brand-radius` as inline CSS vars on a wrapping `div[data-brand]`. `--brand-footer-bg` falls back to `--brand-accent` when a brand doesn't set `colors.footerBackground` (only the demo brand currently does, for a dark navy footer band instead of its light accent). `globals.css` reads all of these into Tailwind v4's `@theme inline` block. Light/dark surface tokens (`--background`, `--card`, `--popover`, `--border`, `--muted`) are separate from brand color and live directly in `:root` / `.dark`.

`BrandLogo` (`components/brand/brand-logo.tsx`) takes a `size` prop (`"default"` for form headers, `"lg"` for the standalone footer logo) — both read from the same `Brand.logo` data, just at different dimensions.

**Gotchas:**
- There is no `tailwind.config.js` (Tailwind v4, CSS-first config). Any `bg-*`/`text-*` utility a shadcn component uses only resolves if the corresponding `--color-*` is registered in the `@theme inline` block in `globals.css` AND the underlying HSL var exists in `:root`/`.dark`. Missing either silently produces a transparent/no-op class, not a build error — this has bitten twice already: once for popover/dropdown backgrounds (fixed by registering `--color-popover`), and once for `text-accent-foreground` on Select/DropdownMenu hover states (fixed by registering `--accent-foreground`/`--color-accent-foreground` — note this one is **not** redefined in `.dark`, since `--brand-accent` itself never changes between themes, so the text sitting on it shouldn't invert either).
- Third-party demo assets (the `vegaspalms-demo` brand's logo/colors/footer badges, all hotlinked from a live site's CDN) are for local visual comparison only — don't ship, screenshot-share, or deploy anything referencing them.

### Cache Components / PPR

`next.config.ts` sets `cacheComponents: true`. Both `register/page.tsx` and `login/page.tsx` are static shells; anything that needs `headers()`/`cookies()` (geo-dependent content) is pulled into its own async Server Component wrapped in `<Suspense>` so it doesn't force the whole page dynamic:
- `RegisterFormData` (register page only) — resolves geo-driven field visibility, hands off to the client `RegisterFormToggle`.
- `TrustBadgesDynamic` — near-CTA badges.
- `AuthFooter` (`site-footer.tsx`) — itself always renders (logo + copyright don't need per-request data), but wraps its own inner `FooterDynamic` (badges + license, geo-dependent) in a nested `<Suspense>`.

Client components that need "now" (e.g. disabling future dates in the date picker, the footer's copyright year) must defer reading `new Date()` to post-mount (see `useMounted`, `hooks/use-mounted.ts`), never during the initial render — reading wall-clock time synchronously breaks the static shell.

### i18n

`next-intl`, locale-prefixed routes. Four locales: `en` (default), `fr`, `de`, `es` — config in `i18n/routing.ts` / `request.ts` / `navigation.ts`. `messages/*.json` hold **UI chrome only** (labels, buttons, validation strings) — CMS-driven content (trust badge labels, footer logos, license text) carries its own per-locale text directly on the CMS record, not in the messages files. `resolveLicenseText`/`resolveBadgeLabel` fall back to `.en` when a locale key is missing on a CMS record — used deliberately for the license text (didn't want to machine-translate legal/compliance wording, so only `en` is set on those two records).

### Forms

`components/auth/auth-forms.tsx` exports `NormalRegisterForm` and `StepperRegisterForm` (react-hook-form + zod, shared `buildRegisterSchema(fieldStatus)`). `components/auth/min-reg-form.tsx` (`MinRegForm`, dynamically imported — see "Performance" below) and `components/auth/login-form.tsx` (`LoginForm`, username + password) are separate, much smaller schemas (`minRegSchema`, `loginSchema` in `lib/validations.ts`) — deliberately not routed through `buildRegisterSchema`/`fieldStatus` since they aren't jurisdiction-driven.

`RegisterFormToggle` (`components/auth/register-form-toggle.tsx`) is the client component with two independent toggles: Full vs. "Quick sign-up" (MinReg), and — only in Full mode — Standard vs. Stepper layout.

Date of birth is a `Calendar`/`Popover` picker (`DobField` in `auth-forms.tsx`), not day/month/year selects — `Calendar` is dynamically imported (react-day-picker only loads once the popover actually opens) with a `captionLayout="dropdown"` and a `startMonth`/`endMonth`/`disabled` range bounding it to 18–100 years old.

The post-submit success state (`components/auth/success-card.tsx`, `SuccessCard`) is shared across all four forms — each resolves its own `t()`-translated `title`/`description` and hands the strings in, rather than each form owning its own copy of the markup.

### Trust badges & footer

Two distinct render spots, same underlying `TrustBadgeRule` shape:
- **Near-CTA badges** (`components/auth/trust-badges.tsx`, `TrustBadgesDynamic`) — geo-only, server-resolved, rendered directly.
- **Footer** (`components/auth/site-footer.tsx`, `AuthFooter`) — composed from `FooterBrand` (client, `useBrand()`, links home) → `FooterDynamic` (server, geo-resolved badges + license) → `FooterCopyright` (client, `useBrand()` + mounted-gated year). The badges list inside `FooterDynamic` gets a **second** filtering pass client-side in `components/auth/footer-badges.tsx` (`FooterBadges`, via `resolveBrandScoped`) — necessary because the active brand is client-only state (`BrandProvider`'s `useState`), which the server-rendered `FooterDynamic` has no way to know; switching brands in the switcher re-filters the footer badges live without a page reload.

Either spot renders each badge via `TrustBadgeMark` (`components/auth/trust-badge-mark.tsx`) — a stateless component (works from both server and client callers) that picks `fill` + `object-contain` inside a fixed-size box for image badges (rather than fixed `width`/`height` props) specifically because footer badges come from third parties with wildly different native aspect ratios; fixed props would mismatch most of them and trigger Next's aspect-ratio console warning.

### Import convention

Every cross-folder import uses the `@/...` alias — never a relative path reaching into a sibling route folder (e.g. `register/` or `login/`). Auth-page-shared pieces (trust badges, footer, language switcher, forms) live in `components/auth/`, imported via `@/components/auth/...` from either page.

### shadcn/ui

`components.json` config (`style: "radix-vega"`, `baseColor: "neutral"`, css vars in `app/[locale]/globals.css`). Components live in `components/ui/`, added via `npx shadcn@latest add <component>`. Every interactive shadcn primitive (`Button`, `Checkbox`, `RadioGroupItem`, `SelectTrigger`/`SelectItem`, `DropdownMenuItem`) explicitly sets `cursor-pointer` — Tailwind v4's Preflight resets `<button>` to `cursor: default`, so this isn't automatic.

### Performance

- `next.config.ts` sets `experimental.optimizePackageImports: ["lucide-react", "date-fns"]` — verified neither package is on Next 16's built-in default-optimized list, so without this every named import from them pays full barrel-file cost.
- Two `next/dynamic` code-splitting boundaries: `MinRegForm` (`register-form-toggle.tsx` — most sessions never toggle to "Quick sign-up") and `Calendar` (`auth-forms.tsx` — react-day-picker only needed once the DOB popover opens, has a sized loading placeholder to avoid layout jank).
- React Compiler is enabled (`reactCompiler: true`) — manual `useMemo`/`memo()`/static-JSX-hoisting are largely redundant here; the compiler handles that class of optimization automatically. `useMemo` still appears in a couple of spots (e.g. `buildRegisterSchema(fieldStatus)`, DOB bounds) mainly for readability/intent, not because the compiler needs the hint.

### Agent skills

`.agents/` and `.claude/` are **not** part of this repo (gitignored) — installed skills live globally at `~/.agents/skills/` / `~/.claude/skills/` instead. `skills-lock.json` at the repo root is a leftover manifest from when they were local; it's untracked and currently stale (references skills that no longer exist in-repo) — safe to ignore or delete, it isn't read by anything in the app.
