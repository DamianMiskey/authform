# Multi-brand, geo-aware, i18n, themeable auth register form

Drop these files into your Next.js 16 App Router project, preserving the paths below.

## Folder structure

```
app/
  [locale]/
    layout.tsx                        <- root layout, ThemeProvider + NextIntlClientProvider
    page.tsx                          <- handles "/" and "/en"/"/fr", redirects to register
    globals.css                       <- brand cascade + light/dark tokens + Tailwind v4 @theme
    (auth)/
      register/
        page.tsx                      <- static shell + PPR dynamic hole
components/
  auth/
    auth-forms.tsx                    <- NormalRegisterForm, StepperRegisterForm
    language-switcher.tsx
    trust-badges.tsx                  <- the one dynamic hole (geo + locale). Lives here,
                                          not inside the register/ route folder, so any
                                          auth page (register, login, ...) can import it
                                          via "@/components/auth/trust-badges" instead of
                                          a relative path that breaks when either file moves.
  brand/
    brand-provider.tsx                <- context + runtime CSS var injection
  theme-provider.tsx                  <- next-themes wrapper
  theme-toggle.tsx                    <- Light/Dark/System buttons
lib/
  cms/
    types.ts                          <- Brand, TrustBadgeRule, CmsAdapter contract
    static-adapter.ts                 <- works out of the box, no CMS needed
    sanity-adapter.ts                 <- example, not wired in by default
    payload-adapter.ts                <- example, not wired in by default
    index.ts                         <- THE swap point — change one line here
  trust-badges.ts                     <- pure country/locale resolution logic
  utils.ts                           <- shadcn's cn() helper
i18n/
  routing.ts / request.ts / navigation.ts
messages/
  en.json / fr.json
proxy.ts                             <- replaces middleware.ts (Next 16 rename)
next.config.ts
package.json
.env.example
```

**Every import in this package uses either a relative path within the
same folder, or the `@/...` alias — never a relative path that reaches
into a sibling route folder.** If you add a new auth page (login, forgot
password, etc.) and it needs trust badges, language switching, or the
theme toggle, import them from `@/components/auth/...` — don't reach
into `register/`'s folder directly.

## Install

```bash
npm install next-intl next-themes react-hook-form @hookform/resolvers zod date-fns clsx tailwind-merge class-variance-authority lucide-react @vercel/functions @radix-ui/react-checkbox @radix-ui/react-progress @radix-ui/react-popover @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-slot react-day-picker
```

Or just use the included `package.json` directly for a fresh POC install.

Copy `.env.example` to `.env.local` and fill in what you need.


## Swapping in a real CMS

Everything CMS-driven — brand colors/logo, trust badge visibility and
text — goes through **`lib/cms/index.ts`**. That's the only file that
needs to change:

```ts
// lib/cms/index.ts
import { sanityAdapter } from "./sanity-adapter"; // uncomment
const adapter = sanityAdapter; // was: staticAdapter
```

Nothing downstream (`BrandProvider`, `TrustBadgesDynamic`, the register
page) imports an adapter directly — they only ever call
`getBrands()`/`getTrustBadges()` from `lib/cms`. Sanity and Payload
adapter files are included as working examples; adjust the GROQ
query / REST field names to match your actual schema.

To add a new CMS-driven field (e.g. a background image, a new trust
badge rule), the pattern is:
1. Add it to the shape in `lib/cms/types.ts`.
2. Return it from `static-adapter.ts` (and update `sanity-adapter.ts` /
   `payload-adapter.ts` if you're using one of those).
3. Consume it wherever needed — usually a Server Component that already
   calls `getBrands()`/`getTrustBadges()`.

## What's genuinely dynamic vs. what's just data

Worth keeping straight, since it's easy to blur the two:

- **Brands** are fetched once per request via `getBrands()`, but that
  fetch itself isn't tied to `headers()`/`cookies()` — so it doesn't
  force the page out of the static shell. It's cacheable CMS data, not
  per-visitor dynamic state.
- **Trust badges** are the same story for *fetching*, but *filtering*
  them by country requires the geo header, which does need `headers()`
  — that's why `TrustBadgesDynamic` is wrapped in `<Suspense>` while the
  rest of the page isn't.
- **Locale** is resolved by `next-intl` via the URL prefix (`/en`, `/fr`),
  which is static-render-compatible — `setRequestLocale()` is what makes
  that work without needing a dynamic API call.

## Geo -> locale nudge (Quebec)

`proxy.ts` redirects first-time CA-QC visitors to `/fr` (Charter of the
French Language), but only if they haven't already made an explicit
choice (`NEXT_LOCALE` cookie). Adjust or remove the `isQuebec` check in
`proxy.ts` if this doesn't apply to your compliance requirements.
