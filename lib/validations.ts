// lib/validations.ts
//
// Zod schemas for form validation. Error messages are next-intl message
// keys (resolved via t(message) in TranslatedError), not literal text —
// that's what keeps validation locale-agnostic. The actual copy lives
// under "errors" in messages/en.json / messages/fr.json.

import * as z from "zod";

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

export const RegisterSchema = z
  .object({
    name: z.string().min(1, { message: "errors.nameRequired" }),

    email: z.string().email({ message: "errors.emailInvalid" }),

    dob: z.date({ required_error: "errors.dobRequired" }),

    password: z.string().min(8, { message: "errors.passwordTooShort" }),

    confirmPassword: z.string(),

    company: z.string().min(1, { message: "errors.companyRequired" }),

    ageConfirm: z.literal(true, {
      errorMap: () => ({ message: "errors.ageConfirmRequired" }),
    }),

    terms: z.literal(true, {
      errorMap: () => ({ message: "errors.termsRequired" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "errors.passwordMismatch",
    path: ["confirmPassword"],
  })
  .refine((data) => !data.dob || calculateAge(data.dob) >= 18, {
    message: "errors.dobUnderage",
    path: ["dob"],
  });

export type RegisterValues = z.infer<typeof RegisterSchema>;
