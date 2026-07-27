"use client";

// components/auth/login-form.tsx
//
// Counterpart to the register forms — same simulated-submit fidelity
// (toast, no real backend) since neither is wired to an actual auth
// service in this POC. Lives under components/auth/ per the import
// convention in CLAUDE.md: any auth page reaches shared pieces via
// "@/components/auth/...", never a relative path into register/.

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { TranslatedError } from "@/components/auth/auth-forms";
import { SuccessCard } from "@/components/auth/success-card";
import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";
import { loginSchema, type LoginValues } from "@/lib/validations";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("auth.common");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
    mode: "onBlur",
  });

  function onSubmit(values: LoginValues) {
    // TODO: POST to the PAM endpoint once one exists.
    setSubmitted(true);
    toast.success(t("success.title"), {
      description: t("success.welcome", { username: values.username }),
    });
  }

  if (submitted) {
    return (
      <SuccessCard
        title={t("success.title")}
        description={t("success.welcome", { username: form.getValues("username") })}
      />
    );
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <div className="min-w-0">
          <BrandLogo />
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <CardAction>
          <Link
            href="/register"
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
          >
            {tCommon("noAccountPrompt")}{" "}
            <span className="font-medium text-primary">{tCommon("register")}</span>
          </Link>
        </CardAction>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.username")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholders.username")} {...field} />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.password")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {t("submit")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
