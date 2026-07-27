# Multi-brand, geo-aware, i18n, themeable auth flow

Drop these files into your Next.js 16 App Router project, preserving the paths below.

Two pages — registration (standard, stepper, or a "quick sign-up" minimal mode) and login — both driven by the same brand/CMS/i18n/geo infrastructure. No real backend: every submit is a simulated success state.

## Folder structure

```
app/
  [locale]/
    layout.tsx                        <- root layout, ThemeProvider + NextIntlClientProvider
    page.tsx                          <- handles "/" and "/en"/"/fr"/"/de"/"/es", redirects to register
    globals.css                       <- brand cascade + light/dark tokens + Tailwind v4 @theme
    (auth)/
      register/
        page.tsx                      <- static shell + PPR dynamic holes (form field visibility, trust badges, footer)
      login/
        page.tsx                      <- same shell, no CMS-driven field visibility needed
components/
  auth/
    auth-forms.tsx                    <- NormalRegisterForm, StepperRegisterForm, shared field groups, DOB Calendar picker
    min-reg-form.tsx                  <- MinRegForm — first name + email only, dynamically imported
    login-form.tsx                    <- LoginForm — username + password
    register-form-toggle.tsx          <- Full/Quick-signup + Standard/Stepper toggles
    register-form-data.tsx            <- Suspense-scoped: resolves geo -> field visibility, hands off to the toggle
    success-card.tsx                  <- shared post-submit state for all four forms
    site-footer.tsx                   <- AuthFooter: brand logo + geo badges/license + copyright, full-width band
    footer-brand.tsx                  <- client half of the footer (useBrand())
    footer-badges.tsx                 <- client-side brand-scoping pass over the server-resolved footer badges
    trust-badges.tsx                  <- near-CTA badges, the "original" dynamic hole (geo + locale)
    trust-badge-mark.tsx              <- renders one badge as an image (fill+object-contain) or a Lucide icon
    language-switcher.tsx
  brand/
    brand-provider.tsx                <- context + runtime CSS var injection
    brand-logo.tsx                    <- size-aware (default | lg)
    brand-switcher.tsx
  theme-provider.tsx                  <- next-themes wrapper
  theme-toggle.tsx                    <- Light/Dark/System buttons
lib/
  cms/
    types.ts                          <- Brand, TrustBadgeRule, RegistrationFieldRule, CmsAdapter contract
    static-adapter.ts                 <- works out of the box, no CMS needed (+ one demo brand preset)
    sanity-adapter.ts                 <- example, not wired in by default
    payload-adapter.ts                <- example, not wired in by default
    index.ts                          <- THE swap point — change one line here
  trust-badges.ts                     <- pure country/locale/brand resolution logic
  registration-fields.ts              <- pure geo -> field-visibility resolution logic
  register-options.ts                 <- static dropdown option lists (countries, currencies, etc.)
  validations.ts                      <- zod schemas: buildRegisterSchema(fieldStatus), minRegSchema, loginSchema
  utils.ts                            <- shadcn's cn() helper
i18n/
  routing.ts / request.ts / navigation.ts / locale-nudge.ts
messages/
  en.json / fr.json / de.json / es.json
proxy.ts                              <- replaces middleware.ts (Next 16 rename)
next.config.ts
package.json
```

**Every import in this package uses either a relative path within the
same folder, or the `@/...` alias — never a relative path that reaches
into a sibling route folder.** Auth-page-shared pieces (forms, footer,
trust badges, language switcher) live in `components/auth/`, imported
via `@/components/auth/...` from either `register/` or `login/`.

## Install

```bash
npm install next-intl next-themes react-hook-form @hookform/resolvers zod date-fns clsx tailwind-merge class-variance-authority lucide-react @vercel/functions @radix-ui/react-checkbox @radix-ui/react-progress @radix-ui/react-popover @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot react-day-picker
```

Or just use the included `package.json` directly for a fresh POC install.

## Swapping in a real CMS

Everything CMS-driven — brand colors/logo, trust badge visibility and
text, registration field visibility — goes through **`lib/cms/index.ts`**.
That's the only file that needs to change:

```ts
// lib/cms/index.ts
import { sanityAdapter } from "./sanity-adapter"; // uncomment
const adapter = sanityAdapter; // was: staticAdapter
```

Nothing downstream (`BrandProvider`, `TrustBadgesDynamic`, `AuthFooter`,
`RegisterFormData`) imports an adapter directly — they only ever call
`getBrands()` / `getTrustBadges()` / `getFooterLogos()` / `getLicenses()`
/ `getRegistrationFields()` from `lib/cms`. Sanity and Payload adapter
files are included as working examples; adjust the GROQ query / REST
field names to match your actual schema.

To add a new CMS-driven field, the pattern is:
1. Add it to the shape in `lib/cms/types.ts`.
2. Return it from `static-adapter.ts` (and update `sanity-adapter.ts` /
   `payload-adapter.ts` if you're using one of those — the contract is
   type-checked against all three even though only one is wired in).
3. Consume it wherever needed — usually a Server Component that already
   calls the relevant `get*()` function.

**Not everything conditional belongs in the CMS/geo system.** The
register form's Province/State field, for example, is driven by what
the user picks in the Country field itself (a plain `useWatch`, see
`ContactFields` in `auth-forms.tsx`), not by geo — it's Albania-specific
content, and tying it to invisible geo data instead of the visible field
the user actually interacts with was a real source of confusion during
development. Use the CMS/geo system (`lib/registration-fields.ts`) for
fields that are genuinely jurisdiction/compliance driven; use a form
watch for fields that just depend on another answer in the same form.

## What's genuinely dynamic vs. what's just data

Worth keeping straight, since it's easy to blur the two:

- **Brands** are fetched once per request via `getBrands()`, but that
  fetch itself isn't tied to `headers()`/`cookies()` — so it doesn't
  force the page out of the static shell. It's cacheable CMS data, not
  per-visitor dynamic state.
- **Trust badges, footer badges/license, and registration field
  visibility** are the same story for *fetching*, but *filtering* them
  by country requires the geo header, which does need `headers()` —
  that's why `TrustBadgesDynamic`, `AuthFooter`'s inner `FooterDynamic`,
  and `RegisterFormData` are each wrapped in their own `<Suspense>` while
  the rest of the page isn't.
- Footer badges get a **second**, client-side filtering pass by brand
  (`FooterBadges`, `resolveBrandScoped`) on top of the server-resolved,
  geo-filtered list — the active brand is client-only state the server
  render has no way to see.
- **Locale** is resolved by `next-intl` via the URL prefix (`/en`, `/fr`,
  `/de`, `/es`), which is static-render-compatible — `setRequestLocale()`
  is what makes that work without needing a dynamic API call.

## Locales

Four out of the box: `en` (default), `fr`, `de`, `es` — add another by
adding it to `i18n/routing.ts`'s `locales` array and creating the
matching `messages/<locale>.json` (mirror the key structure of the
existing files exactly; `next-intl` will otherwise throw on a missing
key at render time). CMS-driven copy (badge labels, license text) is
per-locale on the CMS record itself, not in the messages files, and
falls back to `en` when a locale key is missing.

## Geo -> locale nudge (Quebec)

`proxy.ts` redirects first-time CA-QC visitors to `/fr` (Charter of the
French Language), but only if they haven't already made an explicit
choice (`NEXT_LOCALE` cookie). The actual country/region -> locale rules
live in `i18n/locale-nudge.ts` (a data table, not a branch in `proxy.ts`)
— add a row there for a new market rather than a new `isSomewhere`
boolean.

## Demo brand preset

`lib/cms/static-adapter.ts` includes a `vegaspalms-demo` brand — real
colors/logo/footer badges hotlinked from a live casino site's CDN,
added purely to preview the theming system against a real brand's look.
It's clearly commented at its definition. Don't ship, screenshot-share,
or deploy anything referencing it — remove it before this goes anywhere
beyond local comparison.
