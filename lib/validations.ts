// lib/validations.ts
//
// Zod schemas for form validation. Error messages are next-intl message
// keys (resolved via t(message) in TranslatedError), not literal text —
// that's what keeps validation locale-agnostic. The actual copy lives
// under "errors" in messages/en.json / messages/fr.json.
//
// buildRegisterSchema() takes a FieldStatusMap (lib/registration-fields.ts,
// resolved from CMS rules per jurisdiction) and layers "required if this
// market requires it" on top of a fixed base shape via superRefine — the
// shape itself never changes per market, only which empty fields raise an
// issue, so RegisterValues stays a single stable type no matter what the
// CMS returns.

import * as z from "zod";

import type { RegistrationFieldKey } from "@/lib/cms/types";
import type { FieldStatusMap } from "@/lib/registration-fields";

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

const requiredString = (message: string) => z.string().min(1, { message });

const REQUIRED_ERROR: Record<RegistrationFieldKey, string> = {
  middleName: "errors.middleNameRequired",
  occupationIndustry: "errors.occupationIndustryRequired",
  occupationJobTitle: "errors.occupationJobTitleRequired",
  politicallyExposedPerson: "errors.politicallyExposedPersonRequired",
};

// Base shape is fixed regardless of jurisdiction — CMS-driven requiredness
// is layered on in buildRegisterSchema()'s superRefine, not here.
const baseRegisterObject = z.object({
  // Account
  username: requiredString("errors.usernameRequired").min(3, {
    message: "errors.usernameTooShort",
  }),
  email: z.string().email({ message: "errors.emailInvalid" }),
  password: z.string().min(8, { message: "errors.passwordTooShort" }),
  confirmPassword: z.string(),

  // Personal
  firstName: requiredString("errors.firstNameRequired"),
  middleName: z.string(),
  lastName: requiredString("errors.lastNameRequired"),
  dob: z.date({ required_error: "errors.dobRequired" }),

  // Background
  occupationIndustry: z.string(),
  occupationJobTitle: z.string(),
  country: requiredString("errors.countryRequired"),
  preferredLanguage: requiredString("errors.preferredLanguageRequired"),
  currency: requiredString("errors.currencyRequired"),

  // Contact
  dialCode: requiredString("errors.dialCodeRequired"),
  mobileNumber: requiredString("errors.mobileNumberRequired"),
  addressLine1: requiredString("errors.addressLine1Required"),
  addressLine2: z.string().optional(),
  city: requiredString("errors.cityRequired"),
  stateProvince: z.string(),
  postCode: requiredString("errors.postCodeRequired"),

  // Verify & terms
  politicallyExposedPerson: z.enum(["yes", "no"], {
    required_error: "errors.politicallyExposedPersonRequired",
  }),
  promotionalOffers: z.boolean().optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: "errors.termsRequired" }),
  }),
});

export function buildRegisterSchema(fieldStatus: FieldStatusMap) {
  return baseRegisterObject
    .refine((data) => data.password === data.confirmPassword, {
      message: "errors.passwordMismatch",
      path: ["confirmPassword"],
    })
    .refine((data) => !data.dob || calculateAge(data.dob) >= 18, {
      message: "errors.dobUnderage",
      path: ["dob"],
    })
    .refine((data) => data.country !== "AL" || !!data.stateProvince, {
      message: "errors.stateProvinceRequired",
      path: ["stateProvince"],
    })
    .superRefine((data, ctx) => {
      (Object.keys(REQUIRED_ERROR) as RegistrationFieldKey[]).forEach((field) => {
        if (field === "politicallyExposedPerson") return; // enum default always valid
        if (fieldStatus[field] === "required" && !data[field]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: REQUIRED_ERROR[field],
            path: [field],
          });
        }
      });
    });
}

export type RegisterValues = z.infer<typeof baseRegisterObject>;

// MinReg: the "just enough to provision an account" path — everything
// else (address, occupation, PEP, etc.) gets collected later via
// progressive profiling once the account exists. Independent of
// buildRegisterSchema()/fieldStatus since it isn't jurisdiction-driven,
// it's a deliberately fixed minimal set.
export const minRegSchema = z.object({
  firstName: requiredString("errors.firstNameRequired"),
  email: z.string().email({ message: "errors.emailInvalid" }),
});

export type MinRegValues = z.infer<typeof minRegSchema>;

export const loginSchema = z.object({
  username: requiredString("errors.usernameRequired").min(3, {
    message: "errors.usernameTooShort",
  }),
  password: z.string().min(8, { message: "errors.passwordTooShort" }),
});

export type LoginValues = z.infer<typeof loginSchema>;
