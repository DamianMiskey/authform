"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  User,
  Lock,
  Building2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { RegisterSchema, type RegisterValues } from "@/lib/validations";

const defaultValues: RegisterValues = {
  name: "",
  email: "",
  dob: undefined as unknown as Date,
  password: "",
  confirmPassword: "",
  company: "",
  ageConfirm: undefined as unknown as true,
  terms: undefined as unknown as true,
};

type RegisterStep = 1 | 2 | 3;

const STEP_FIELDS: Record<RegisterStep, (keyof RegisterValues)[]> = {
  1: ["name", "email", "dob"],
  2: ["password", "confirmPassword"],
  3: ["company", "ageConfirm", "terms"],
};

function TranslatedError({ message }: Readonly<{ message?: string }>) {
  const t = useTranslations();
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-destructive mt-1">{t(message)}</p>
  );
}

export function NormalRegisterForm() {
  const t = useTranslations("auth.register");
  const [submitted, setSubmitted] = useState(false);
  // useMounted() defers to after hydration so the initial (server) render
  // never reads the current time — required under Next's Cache Components
  // static shell.
  const mounted = useMounted();
  // Nobody under 18 can register, so the most recent selectable date of
  // birth is 18 years back from today — not today itself.
  const maxDob = useMemo(() => {
    if (!mounted) return undefined;
    const today = new Date();
    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }, [mounted]);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues,
    mode: "onBlur",
  });

  function onSubmit(values: RegisterValues) {
    setSubmitted(true);
    toast.success(t("success.title"), {
      description: t("success.welcome", { name: values.name }),
    });
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-emerald-100 p-3">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="font-medium">{t("success.title")}</p>
          <p className="text-sm text-muted-foreground">
            {t("success.welcome", { name: form.getValues("name") })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <BrandLogo />
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholders.name")} {...field} />
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
                    <Input
                      type="email"
                      placeholder={t("placeholders.email")}
                      {...field}
                    />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t("fields.dob")}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : t("placeholders.pickDate")}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown"
                        startMonth={new Date(1920, 0)}
                        endMonth={maxDob}
                        disabled={(date) => (maxDob ? date > maxDob : false)}
                      />
                    </PopoverContent>
                  </Popover>
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{t("fields.company")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("placeholders.company")} {...field} />
                  </FormControl>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ageConfirm"
              render={({ field, fieldState }) => (
                <FormItem className="flex items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal leading-snug">
                    {t("checkboxes.ageConfirm")}
                  </FormLabel>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field, fieldState }) => (
                <FormItem className="flex items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal leading-snug">
                    {t("checkboxes.terms")}
                  </FormLabel>
                  <TranslatedError message={fieldState.error?.message} />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {t("submit")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

export function StepperRegisterForm({
  defaultStep = 1,
  triggerErrorsOnMount = false,
}: Readonly<{
  defaultStep?: RegisterStep;
  triggerErrorsOnMount?: boolean;
}> = {}) {
  const t = useTranslations("auth.register");
  const [step, setStep] = useState(defaultStep);
  const [submitted, setSubmitted] = useState(false);
  // useMounted() defers to after hydration so the initial (server) render
  // never reads the current time — required under Next's Cache Components
  // static shell.
  const mounted = useMounted();
  // Nobody under 18 can register, so the most recent selectable date of
  // birth is 18 years back from today — not today itself.
  const maxDob = useMemo(() => {
    if (!mounted) return undefined;
    const today = new Date();
    return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }, [mounted]);

  const STEPS = [
    { id: 1, title: t("steps.account"), icon: User },
    { id: 2, title: t("steps.security"), icon: Lock },
    { id: 3, title: t("steps.organization"), icon: Building2 },
  ] as const;

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (triggerErrorsOnMount) {
      form.trigger(STEP_FIELDS[defaultStep]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (!valid) return;

    if (step < STEPS.length) {
      setStep((s) => (s + 1) as RegisterStep);
    } else {
      await form.handleSubmit((values) => {
        setSubmitted(true);
        toast.success(t("success.title"), {
          description: t("success.welcomeWithCompany", {
            name: values.name,
            company: values.company,
          }),
        });
      })();
    }
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1) as RegisterStep);
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-emerald-100 p-3">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="font-medium">{t("success.title")}</p>
          <p className="text-sm text-muted-foreground">
            {t("success.welcomeWithCompany", {
              name: form.getValues("name"),
              company: form.getValues("company"),
            })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <BrandLogo />
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("stepLabel", {
            step,
            total: STEPS.length,
            title: STEPS[step - 1].title,
          })}
        </CardDescription>
        <Progress value={(step / STEPS.length) * 100} className="mt-2" />
        <div className="flex justify-between pt-3">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = s.id === step;
            const done = s.id < step;
            return (
              <div
                key={s.id}
                className="flex flex-col items-center gap-1 text-xs"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border
                    ${done ? "bg-primary text-primary-foreground border-primary" : ""}
                    ${active ? "border-primary text-primary" : "border-muted text-muted-foreground"}`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={
                    active ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <Form {...form}>
        <CardContent className="space-y-4 min-h-45">
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("fields.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("placeholders.name")} {...field} />
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
                      <Input
                        type="email"
                        placeholder={t("placeholders.email")}
                        {...field}
                      />
                    </FormControl>
                    <TranslatedError message={fieldState.error?.message} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("fields.dob")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "PPP")
                              : t("placeholders.pickDate")}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          startMonth={new Date(1920, 0)}
                          endMonth={maxDob}
                          disabled={(date) => (maxDob ? date > maxDob : false)}
                        />
                      </PopoverContent>
                    </Popover>
                    <TranslatedError message={fieldState.error?.message} />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 2 && (
            <>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("fields.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <TranslatedError message={fieldState.error?.message} />
                  </FormItem>
                )}
              />
            </>
          )}

          {step === 3 && (
            <>
              <FormField
                control={form.control}
                name="company"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{t("fields.company")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("placeholders.company")}
                        {...field}
                      />
                    </FormControl>
                    <TranslatedError message={fieldState.error?.message} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageConfirm"
                render={({ field, fieldState }) => (
                  <FormItem className="flex items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal leading-snug">
                      {t("checkboxes.ageConfirm")}
                    </FormLabel>
                    <TranslatedError message={fieldState.error?.message} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terms"
                render={({ field, fieldState }) => (
                  <FormItem className="flex items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value === true}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal leading-snug">
                      {t("checkboxes.terms")}
                    </FormLabel>
                    <TranslatedError message={fieldState.error?.message} />
                  </FormItem>
                )}
              />
            </>
          )}
        </CardContent>
      </Form>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={goBack} disabled={step === 1}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {t("back")}
        </Button>
        <Button onClick={goNext} disabled={form.formState.isSubmitting}>
          {step === STEPS.length ? t("submit") : t("continue")}
          {step !== STEPS.length && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
