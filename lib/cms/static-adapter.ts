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
    ];
  },

  async getTrustBadges() {
    return [
      {
        id: "responsible-gambling-ca",
        imageUrl: "/badges/responsible-gambling-canada.svg",
        labels: {
          en: "Registered with the Alcohol and Gaming Commission of Ontario",
          fr: "Enregistré auprès de la Commission des alcools et des jeux de l'Ontario",
        },
        countries: ["CA"],
      },
      {
        id: "ssl-secure",
        imageUrl: "/badges/ssl-secure.svg",
        labels: { en: "SSL Secured", fr: "Sécurisé SSL" },
      },
    ];
  },

  async getFooterLogos() {
    return [
      {
        id: "trustq-nz",
        imageUrl: "/badges/trustq-nz.svg",
        labels: { en: "TrustQ Verified — New Zealand", fr: "TrustQ Vérifié — Nouvelle-Zélande" },
        countries: ["NZ"],
      },
      {
        id: "trustq-global",
        imageUrl: "/badges/trustq-global.svg",
        labels: { en: "TrustQ Certified", fr: "TrustQ Certifié" },
        excludeCountries: ["NZ"],
      },
    ];
  },

  async getLicenses() {
    return [
      {
        id: "license-nz",
        text: {
          en: "Licensed and regulated in New Zealand under the Gambling Act 2003.",
          fr: "Sous licence et réglementé en Nouvelle-Zélande en vertu du Gambling Act 2003.",
        },
        countries: ["NZ"],
      },
      {
        id: "license-row",
        text: {
          en: "Licensed and regulated by the Government of Curaçao under license no. 8048/JAZ2024-101.",
          fr: "Sous licence et réglementé par le gouvernement de Curaçao (licence n° 8048/JAZ2024-101).",
        },
        excludeCountries: ["NZ"],
      },
    ];
  },
};
