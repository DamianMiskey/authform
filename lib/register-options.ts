// lib/register-options.ts
//
// Static option lists for the registration form's dropdowns. Kept
// deliberately small (major casino markets / currencies only) rather than
// full ISO-3166 lists — this is a POC, not a production KYC form.

export const COUNTRIES = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "IE", label: "Ireland" },
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "DE", label: "Germany" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "FI", label: "Finland" },
  { value: "AL", label: "Albania" },
] as const;

// ISO 3166-1 alpha-2 -> flag emoji, built from the Unicode regional
// indicator symbols (each letter offset into that block) rather than a
// hardcoded per-country map or an icon package — works for any two-letter
// code without extra assets or a dependency.
export function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + (char.codePointAt(0) ?? 0)));
}

export const CURRENCIES = [
  { value: "CAD", symbol: "$", label: "CAD – Canadian Dollar" },
  { value: "USD", symbol: "$", label: "USD – US Dollar" },
  { value: "EUR", symbol: "€", label: "EUR – Euro" },
  { value: "GBP", symbol: "£", label: "GBP – British Pound" },
  { value: "AUD", symbol: "$", label: "AUD – Australian Dollar" },
  { value: "NZD", symbol: "$", label: "NZD – New Zealand Dollar" },
  { value: "SEK", symbol: "kr", label: "SEK – Swedish Krona" },
  { value: "NOK", symbol: "kr", label: "NOK – Norwegian Krone" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
] as const;

export const DIAL_CODES = [
  { value: "+1", label: "+1 (US/Canada)" },
  { value: "+44", label: "+44 (UK)" },
  { value: "+353", label: "+353 (Ireland)" },
  { value: "+61", label: "+61 (Australia)" },
  { value: "+64", label: "+64 (New Zealand)" },
  { value: "+49", label: "+49 (Germany)" },
  { value: "+43", label: "+43 (Austria)" },
  { value: "+41", label: "+41 (Switzerland)" },
  { value: "+46", label: "+46 (Sweden)" },
  { value: "+47", label: "+47 (Norway)" },
  { value: "+358", label: "+358 (Finland)" },
  { value: "+355", label: "+355 (Albania)" },
] as const;

export const ALBANIA_COUNTIES = [
  { value: "berat", label: "Berat (County)" },
  { value: "bulqize", label: "Bulqize" },
  { value: "delvine", label: "Delvine" },
  { value: "devoll", label: "Devoll" },
  { value: "diber", label: "Diber" },
  { value: "durres", label: "Durres County" },
  { value: "elbasan", label: "Elbasan (County)" },
  { value: "fier", label: "Fier (County)" },
  { value: "gjirokaster", label: "Gjirokaster" },
  { value: "gramsh", label: "Gramsh" },
  { value: "has", label: "Has" },
  { value: "kavaje", label: "Kavaje" },
  { value: "kolonje", label: "Kolonje" },
  { value: "korce", label: "Korce County" },
  { value: "kruje", label: "Kruje" },
  { value: "kucove", label: "Kucove" },
  { value: "kukes", label: "Kukes" },
  { value: "kurbin", label: "Kurbin" },
  { value: "lezhe", label: "Lezhe" },
  { value: "librazhd", label: "Librazhd" },
  { value: "lushnje", label: "Lushnje" },
  { value: "malesi-e-madhe", label: "Malesi e Madhe" },
  { value: "mallakaster", label: "Mallakaster" },
  { value: "mat", label: "Mat" },
  { value: "mirdite", label: "Mirdite" },
  { value: "peqin", label: "Peqin" },
  { value: "permet", label: "Permet" },
  { value: "pogradec", label: "Pogradec" },
  { value: "puke", label: "Puke" },
  { value: "sarande", label: "Sarande" },
  { value: "shkoder", label: "Shkoder" },
  { value: "skrapar", label: "Skrapar" },
  { value: "tepelene", label: "Tepelene" },
  { value: "tirane", label: "Tirane (County)" },
  { value: "tropoje", label: "Tropoje" },
  { value: "vlore", label: "Vlore" },
] as const;

export const OCCUPATION_INDUSTRIES = [
  { value: "accounting-finance", label: "Accounting & Finance" },
  { value: "banking", label: "Banking" },
  { value: "construction", label: "Construction" },
  { value: "education", label: "Education" },
  { value: "government", label: "Government" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "it-technology", label: "IT & Technology" },
  { value: "legal", label: "Legal" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "self-employed", label: "Self-Employed" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed / Retired" },
  { value: "other", label: "Other" },
] as const;
