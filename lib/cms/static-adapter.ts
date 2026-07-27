// lib/cms/static-adapter.ts
//
// Zero-dependency fallback so the app runs immediately after import,
// before Sanity/Payload is wired up. Same shape the real adapters return,
// so swapping later is a one-line change in lib/cms/index.ts.

import type { CmsAdapter } from "./types";

export const staticAdapter: CmsAdapter = {
  async getBrands() {
    return [
      {
        id: "acme",
        name: "Acme",
        logo: { text: "ACME" },
        colors: { primary: "24 95% 53%", primaryForeground: "0 0% 100%", accent: "24 95% 96%", ring: "24 95% 53%" },
      },
      {
        id: "nova",
        name: "Nova",
        logo: { text: "NOVA" },
        colors: { primary: "262 83% 58%", primaryForeground: "0 0% 100%", accent: "262 83% 96%", ring: "262 83% 58%" },
      },
      {
        id: "lumen",
        name: "Lumen",
        logo: { text: "LUMEN" },
        colors: { primary: "158 64% 40%", primaryForeground: "0 0% 100%", accent: "158 64% 95%", ring: "158 64% 40%" },
      },
      // Temporary visual-comparison preset — colors pulled from the live
      // --color-cta/--color-ctaText/--color-ctaOffer CSS custom properties
      // on vegaspalmscasino.com, logo hotlinked from their Sanity CDN. Only
      // for local side-by-side theming preview; remove before anything
      // resembling a real deployment (third-party asset + branding, not
      // ours to ship).
      {
        id: "vegaspalms-demo",
        name: "Vegas Palms (demo)",
        logo: {
          text: "VEGAS PALMS",
          imageUrl:
            "https://cdn.sanity.io/images/lrwcv8e1/production/1b07480148332b7a29622a609c60ed679bb5ccaa-148x63.svg",
        },
        colors: {
          primary: "196 100% 49%",
          primaryForeground: "223 53% 12%",
          accent: "45 98% 68%",
          ring: "196 100% 49%",
          footerBackground: "222 52% 11%", // #0e172c, as requested
        },
      },
    ];
  },

  async getTrustBadges() {
    return [
      {
        id: "ssl-secure",
        icon: "shield-check",
        labels: { en: "SSL Secured", fr: "Sécurisé SSL" },
      },
    ];
  },

  async getFooterLogos() {
    return [
      // Same temporary-demo caveat as the vegaspalms-demo brand above:
      // images hotlinked from vegaspalmscasino.com's Sanity CDN, scoped
      // via `brands` so they only ever appear for that one preset. Local
      // comparison only — not for anything resembling a real deployment.
      {
        id: "vpc-apricot",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/fd2cb3df06d15df178d0af28a19228fb874c4d1f-650x274.svg",
        labels: { en: "Apricot", fr: "Apricot" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-pragmatic-play",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/d966f8b5d91e686ba30cc553d6e4d625aa452f7b-246x110.svg",
        labels: { en: "Pragmatic Play", fr: "Pragmatic Play" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-on-air",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/8f76f25849f188c583a2fe9c47437bf8adf3f5a9-788x248.svg",
        labels: { en: "On Air", fr: "On Air" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-kahnawake",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/933d7fe557c0f6b715057e7d3ee4be8ee26a5464-157x45.svg",
        labels: { en: "Kahnawake Gaming Commission", fr: "Kahnawake Gaming Commission" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-ecogra",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/fb3412d4470be966a3dbd85fb38569dbe2e79cf1-112x45.svg",
        labels: { en: "eCogra", fr: "eCogra" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-18plus",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/0c31ecb02396c285b91a61eb324c363012e798b7-64x64.svg",
        labels: { en: "18+", fr: "18+" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-gordon-moody",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/6196a78003f1cad25883edb1e011a05b75bd26cd-300x112.svg",
        labels: { en: "Gordon Moody", fr: "Gordon Moody" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-interac",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/cb4f48957c3c859205b603d3fcb2fe379e52189f-174x174.svg",
        labels: { en: "Interac", fr: "Interac" },
        brands: ["vegaspalms-demo"],
        countries: ["CA"],
      },
      {
        id: "vpc-visa",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/a342291376b0f5c1f0b22a0e0732f4f088999ab6-151x75.svg",
        labels: { en: "Visa", fr: "Visa" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-mastercard",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/3fa4ef410e1d5dfe8cf0df8da1ded78357ba1cf3-146x20.svg",
        labels: { en: "Mastercard", fr: "Mastercard" },
        brands: ["vegaspalms-demo"],
      },
      {
        id: "vpc-paysafecard",
        imageUrl:
          "https://cdn.sanity.io/images/lrwcv8e1/production/d8c5e48b3ff66f8da043a16d689ef53c9f183cdd-500x75.svg",
        labels: { en: "PaysafeCard", fr: "PaysafeCard" },
        brands: ["vegaspalms-demo"],
      },
    ];
  },

  async getLicenses() {
    return [
      {
        // No `fr` key on purpose — this is licensing/compliance text, and a
        // machine-guessed legal translation would be worse than falling
        // back to English (resolveLicenseText already does that fallback).
        id: "license-nz",
        text: {
          en: "Baytree Interactive Ltd (69691), a Guernsey registered company with registered address at Ground Floor, Kingsway House, Havilland Street, St Peter Port, Guernsey. Baytree (Alderney) Limited is licensed under the Alderney Gambling Control Commission, eGaming license number 155 C1 (Issued on the 15 December 2020)",
        },
        countries: ["NZ"],
      },
      {
        id: "license-row",
        text: {
          en: "Baytree Interactive Ltd (69691), a Guernsey registered company with registered address at Ground Floor, Kingsway House, Havilland Street, St Peter Port, Guernsey. Baytree Interactive Ltd is licensed by the Kahnawake Gaming Commission, license number: 00892 (issued 16 February 2022)",
        },
        excludeCountries: ["NZ"],
      },
    ];
  },

  async getRegistrationFields() {
    return [
      // stateProvince is intentionally NOT here — it's Albania-only content
      // now, so its visibility is driven directly by the Country field the
      // user selects (see ContactFields' useWatch), not by geo. Country
      // selection is visible UI the user controls; geo is invisible to them
      // and was causing the field to seem to randomly disappear.

      // DACH doesn't commonly collect a middle name on sign-up forms.
      { field: "middleName", status: "hidden", countries: ["DE", "AT", "CH"] },

      // NZ gets a lighter-touch KYC flow (mirrors the NZ-specific TrustQ
      // badge/license already in getFooterLogos/getLicenses above).
      { field: "occupationIndustry", status: "hidden", countries: ["NZ"] },
      { field: "occupationJobTitle", status: "hidden", countries: ["NZ"] },
      { field: "politicallyExposedPerson", status: "hidden", countries: ["NZ"] },
    ];
  },
};
