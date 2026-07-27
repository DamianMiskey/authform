"use client";

// components/auth/min-reg-form.tsx
//
// MinReg: the minimum-detail signup path. Only what's needed to
// provision an account (currently first name + email — see
// lib/validations.ts's minRegSchema) rather than the full KYC-shaped
// register form. onSubmit is a local simulation for now; swap it for a
// real POST once the PAM (Player Account Management) endpoint exists —
// the rest of the profile would get collected later via progressive
// profiling against that account.

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AlreadyHaveAccountLink, TranslatedError } from "@/components/auth/auth-forms";
import { SuccessCard } from "@/components/auth/success-card";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { minRegSchema, type MinRegValues } from "@/lib/validations";

export function MinRegForm() {
  const t = useTranslations("auth.register");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<MinRegValues>({
    resolver: zodResolver(minRegSchema),
    defaultValues: { firstName: "", email: "" },
    mode: "onBlur",
  });

  function onSubmit(values: MinRegValues) {
    // TODO: POST to the PAM endpoint once one exists.
    setSubmitted(true);
    toast.success(t("success.title"), {
      description: t("success.welcome", { name: values.firstName }),
    });
  }

  if (submitted) {
    return (
      <SuccessCard
        title={t("success.title")}
        description={t("success.welcome", { name: form.getValues("firstName") })}
      />
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="min-w-0">
          <BrandLogo />
          <CardTitle>{t("minReg.title")}</CardTitle>
          <CardDescription>{t("minReg.description")}</CardDescription>
        </div>
        <AlreadyHaveAccountLink />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.firstName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholders.firstName")} {...field} />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t("placeholders.email")} {...field} />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {t("minReg.submit")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
