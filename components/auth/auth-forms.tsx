"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, type Locale } from "date-fns";
import { de, enUS, es, fr } from "date-fns/locale";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  User,
  IdCard,
  Briefcase,
  Phone,
  ShieldCheck,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";

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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMounted } from "@/hooks/use-mounted";
import { Link } from "@/i18n/navigation";
import {
  ALBANIA_COUNTIES,
  COUNTRIES,
  countryFlag,
  CURRENCIES,
  LANGUAGES,
  DIAL_CODES,
  OCCUPATION_INDUSTRIES,
} from "@/lib/register-options";
import type { FieldStatusMap } from "@/lib/registration-fields";
import { cn } from "@/lib/utils";
import { buildRegisterSchema, type RegisterValues } from "@/lib/validations";

const DATE_FNS_LOCALES: Record<string, Locale> = { en: enUS, fr, de, es };

// react-day-picker's module graph only loads once a user actually opens
// the DOB popover, instead of shipping in the same chunk as the rest of
// the form.
const Calendar = dynamic(() => import("@/components/ui/calendar").then((m) => m.Calendar), {
  loading: () => <div className="h-[286px] w-[260px] animate-pulse rounded-md bg-muted" />,
});

const defaultValues: RegisterValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dob: undefined as unknown as Date,
  occupationIndustry: "",
  occupationJobTitle: "",
  country: "",
  preferredLanguage: "en",
  currency: "",
  dialCode: "",
  mobileNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateProvince: "",
  postCode: "",
  politicallyExposedPerson: "no",
  promotionalOffers: false,
  terms: undefined as unknown as true,
};

type RegisterStep = 1 | 2 | 3 | 4 | 5;

const STEP_FIELDS: Record<RegisterStep, (keyof RegisterValues)[]> = {
  1: ["username", "email", "password", "confirmPassword"],
  2: ["firstName", "middleName", "lastName", "dob"],
  3: [
    "occupationIndustry",
    "occupationJobTitle",
    "country",
    "preferredLanguage",
    "currency",
  ],
  4: [
    "dialCode",
    "mobileNumber",
    "addressLine1",
    "addressLine2",
    "city",
    "stateProvince",
    "postCode",
  ],
  5: ["politicallyExposedPerson", "promotionalOffers", "terms"],
};

// Bounds the DOB calendar to 100 years back through 18 years back from
// today. Depends on wall-clock time, so callers must only use a populated
// value after mount (see the `mounted` gate in each form component below) —
// reading `new Date()` during the initial render breaks the Cache
// Components static shell.
function useDobBounds(mounted: boolean): { minDate?: Date; maxDate?: Date } {
  return useMemo(() => {
    if (!mounted) return {};
    const today = new Date();
    return {
      minDate: new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()),
      maxDate: new Date(today.getFullYear() - 18, today.getMonth(), today.getDate()),
    };
  }, [mounted]);
}

export function TranslatedError({ message }: Readonly<{ message?: string }>) {
  const t = useTranslations();
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-destructive mt-1">{t(message)}</p>
  );
}

// Top-right CardAction shared by every register variant (standard,
// stepper, MinReg) — CardHeader's grid already reserves col 2 for
// data-slot="card-action", so this just needs to be a CardHeader child.
export function AlreadyHaveAccountLink() {
  const tCommon = useTranslations("auth.common");
  return (
    <CardAction>
      <Link
        href="/login"
        className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
      >
        {tCommon("haveAccountPrompt")}{" "}
        <span className="font-medium text-primary">{tCommon("logIn")}</span>
      </Link>
    </CardAction>
  );
}

function DobField({
  control,
  minDate,
  maxDate,
}: Readonly<{
  control: Control<RegisterValues>;
  minDate?: Date;
  maxDate?: Date;
}>) {
  const t = useTranslations("auth.register");
  const locale = useLocale();
  const dateLocale = DATE_FNS_LOCALES[locale] ?? enUS;
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={control}
      name="dob"
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{t("fields.dob")}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full cursor-pointer justify-start font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {field.value
                    ? format(field.value, "PPP", { locale: dateLocale })
                    : t("placeholders.dob")}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                defaultMonth={field.value ?? maxDate}
                onSelect={(date) => {
                  field.onChange(date);
                  setOpen(false);
                }}
                captionLayout="dropdown"
                startMonth={minDate}
                endMonth={maxDate}
                disabled={minDate && maxDate ? { before: minDate, after: maxDate } : undefined}
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>
          <TranslatedError message={fieldState.error?.message} />
        </FormItem>
      )}
    />
  );
}

function AccountFields({ control }: Readonly<{ control: Control<RegisterValues> }>) {
  const t = useTranslations("auth.register");
  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
        control={control}
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
        control={control}
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
  );
}

function PersonalFields({
  control,
  fieldStatus,
  dobBounds,
}: Readonly<{
  control: Control<RegisterValues>;
  fieldStatus: FieldStatusMap;
  dobBounds: { minDate?: Date; maxDate?: Date };
}>) {
  const t = useTranslations("auth.register");
  return (
    <>
      <FormField
        control={control}
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
      {fieldStatus.middleName !== "hidden" && (
        <FormField
          control={control}
          name="middleName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("fields.middleName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("placeholders.middleName")} {...field} />
              </FormControl>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="lastName"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.lastName")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholders.lastName")} {...field} />
            </FormControl>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />

      <DobField control={control} minDate={dobBounds.minDate} maxDate={dobBounds.maxDate} />
    </>
  );
}

function BackgroundFields({
  control,
  fieldStatus,
}: Readonly<{ control: Control<RegisterValues>; fieldStatus: FieldStatusMap }>) {
  const t = useTranslations("auth.register");
  return (
    <>
      {fieldStatus.occupationIndustry !== "hidden" && (
        <FormField
          control={control}
          name="occupationIndustry"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("fields.occupationIndustry")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("placeholders.occupationIndustry")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {OCCUPATION_INDUSTRIES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
      )}
      {fieldStatus.occupationJobTitle !== "hidden" && (
        <FormField
          control={control}
          name="occupationJobTitle"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("fields.occupationJobTitle")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("placeholders.occupationJobTitle")}
                  {...field}
                />
              </FormControl>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="country"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.country")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("placeholders.country")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span aria-hidden="true">{countryFlag(c.value)}</span> {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="preferredLanguage"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.preferredLanguage")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("placeholders.preferredLanguage")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="currency"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.currency")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("placeholders.currency")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <span aria-hidden="true">{c.symbol}</span> {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
    </>
  );
}

function ContactFields({
  control,
}: Readonly<{ control: Control<RegisterValues> }>) {
  const t = useTranslations("auth.register");
  // Province/State is Albania-only content, so it's driven directly by
  // what the user picks in the Country field (visible UI), not by geo —
  // see the comment in lib/cms/static-adapter.ts's getRegistrationFields.
  const country = useWatch({ control, name: "country" });
  return (
    <>
      <div className="flex gap-2">
        <FormField
          control={control}
          name="dialCode"
          render={({ field, fieldState }) => (
            <FormItem className="w-28 shrink-0">
              <FormLabel>{t("fields.dialCode")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.dialCode")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DIAL_CODES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="mobileNumber"
          render={({ field, fieldState }) => (
            <FormItem className="flex-1">
              <FormLabel>{t("fields.mobileNumber")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t("placeholders.mobileNumber")}
                  {...field}
                />
              </FormControl>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="addressLine1"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.addressLine1")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholders.addressLine1")} {...field} />
            </FormControl>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="addressLine2"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.addressLine2")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholders.addressLine2")} {...field} />
            </FormControl>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="city"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.city")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholders.city")} {...field} />
            </FormControl>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
      {country === "AL" && (
        <FormField
          control={control}
          name="stateProvince"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("fields.stateProvince")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("placeholders.stateProvince")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ALBANIA_COUNTIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="postCode"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t("fields.postCode")}</FormLabel>
            <FormControl>
              <Input placeholder={t("placeholders.postCode")} {...field} />
            </FormControl>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
    </>
  );
}

function VerifyFields({
  control,
  fieldStatus,
}: Readonly<{ control: Control<RegisterValues>; fieldStatus: FieldStatusMap }>) {
  const t = useTranslations("auth.register");
  return (
    <>
      {fieldStatus.politicallyExposedPerson !== "hidden" && (
        <FormField
          control={control}
          name="politicallyExposedPerson"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>{t("fields.politicallyExposedPerson")}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="pep-no" />
                    <label htmlFor="pep-no" className="cursor-pointer text-sm font-normal">
                      {t("radio.politicallyExposedPerson.no")}
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="pep-yes" />
                    <label htmlFor="pep-yes" className="cursor-pointer text-sm font-normal">
                      {t("radio.politicallyExposedPerson.yes")}
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <TranslatedError message={fieldState.error?.message} />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={control}
        name="promotionalOffers"
        render={({ field, fieldState }) => (
          <FormItem className="flex items-start space-x-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value === true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="cursor-pointer font-normal leading-snug">
              {t("checkboxes.promotionalOffers")}
            </FormLabel>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <FormItem className="flex items-start space-x-2 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value === true}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <FormLabel className="cursor-pointer font-normal leading-snug">
              {t("checkboxes.terms")}
            </FormLabel>
            <TranslatedError message={fieldState.error?.message} />
          </FormItem>
        )}
      />
    </>
  );
}

export function NormalRegisterForm({
  fieldStatus,
}: Readonly<{ fieldStatus: FieldStatusMap }>) {
  const t = useTranslations("auth.register");
  const [submitted, setSubmitted] = useState(false);
  const mounted = useMounted();
  const dobBounds = useDobBounds(mounted);

  const schema = useMemo(() => buildRegisterSchema(fieldStatus), [fieldStatus]);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  function onSubmit(values: RegisterValues) {
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
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <AlreadyHaveAccountLink />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <AccountFields control={form.control} />
            <p className="text-sm font-medium text-muted-foreground pt-2">
              {t("steps.personal")}
            </p>
            <PersonalFields
              control={form.control}
              fieldStatus={fieldStatus}
              dobBounds={dobBounds}
            />
            <p className="text-sm font-medium text-muted-foreground pt-2">
              {t("steps.background")}
            </p>
            <BackgroundFields control={form.control} fieldStatus={fieldStatus} />
            <p className="text-sm font-medium text-muted-foreground pt-2">
              {t("steps.contact")}
            </p>
            <ContactFields control={form.control} />
            <p className="text-sm font-medium text-muted-foreground pt-2">
              {t("steps.verify")}
            </p>
            <VerifyFields control={form.control} fieldStatus={fieldStatus} />
          </CardContent>
          <CardFooter className="pt-4">
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
  fieldStatus,
  defaultStep = 1,
  triggerErrorsOnMount = false,
  indicatorVariant = "icon",
}: Readonly<{
  fieldStatus: FieldStatusMap;
  defaultStep?: RegisterStep;
  triggerErrorsOnMount?: boolean;
  indicatorVariant?: "icon" | "number";
}>) {
  const t = useTranslations("auth.register");
  const [step, setStep] = useState(defaultStep);
  const [submitted, setSubmitted] = useState(false);
  const mounted = useMounted();
  const dobBounds = useDobBounds(mounted);

  const STEPS = [
    { id: 1, title: t("steps.account"), icon: User },
    { id: 2, title: t("steps.personal"), icon: IdCard },
    { id: 3, title: t("steps.background"), icon: Briefcase },
    { id: 4, title: t("steps.contact"), icon: Phone },
    { id: 5, title: t("steps.verify"), icon: ShieldCheck },
  ] as const;

  const schema = useMemo(() => buildRegisterSchema(fieldStatus), [fieldStatus]);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(schema),
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
          description: t("success.welcome", { name: values.firstName }),
        });
      })();
    }
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1) as RegisterStep);
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
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("stepLabel", {
              step,
              total: STEPS.length,
              title: STEPS[step - 1].title,
            })}
          </CardDescription>
        </div>
        <AlreadyHaveAccountLink />
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
                  ) : indicatorVariant === "number" ? (
                    <span className="text-xs font-medium">{s.id}</span>
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
          {step === 1 && <AccountFields control={form.control} />}
          {step === 2 && (
            <PersonalFields
              control={form.control}
              fieldStatus={fieldStatus}
              dobBounds={dobBounds}
            />
          )}
          {step === 3 && (
            <BackgroundFields control={form.control} fieldStatus={fieldStatus} />
          )}
          {step === 4 && (
            <ContactFields control={form.control} />
          )}
          {step === 5 && <VerifyFields control={form.control} fieldStatus={fieldStatus} />}
        </CardContent>
      </Form>

      <CardFooter className="flex justify-between pt-4">
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
