"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { FieldStatusMap } from "@/lib/registration-fields";

import { NormalRegisterForm, StepperRegisterForm } from "./auth-forms";

// Most sessions never touch "Quick sign-up" (regMode defaults to "full"),
// so this keeps min-reg-form's chunk out of the initial bundle entirely.
const MinRegForm = dynamic(() => import("./min-reg-form").then((m) => m.MinRegForm));

const OPTIONS = ["normal", "stepper"] as const;
const INDICATOR_OPTIONS = ["icon", "number"] as const;
const REG_MODE_OPTIONS = ["full", "minReg"] as const;

export function RegisterFormToggle({
  fieldStatus,
}: Readonly<{ fieldStatus: FieldStatusMap }>) {
  const t = useTranslations("auth.register.layoutToggle");
  const tIndicator = useTranslations("auth.register.indicatorToggle");
  const tRegMode = useTranslations("auth.register.regModeToggle");
  const [regMode, setRegMode] = useState<(typeof REG_MODE_OPTIONS)[number]>("full");
  const [mode, setMode] = useState<(typeof OPTIONS)[number]>("normal");
  const [indicatorVariant, setIndicatorVariant] =
    useState<(typeof INDICATOR_OPTIONS)[number]>("icon");

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex items-center gap-0.5 rounded-md border bg-card p-0.5">
        {REG_MODE_OPTIONS.map((opt) => (
          <Button
            key={opt}
            variant={regMode === opt ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3"
            onClick={() => setRegMode(opt)}
          >
            {opt === "full" ? tRegMode("full") : tRegMode("minReg")}
          </Button>
        ))}
      </div>

      {regMode === "full" && (
        <>
          <div className="flex items-center gap-0.5 rounded-md border bg-card p-0.5">
            {OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant={mode === opt ? "default" : "ghost"}
                size="sm"
                className="h-7 px-3"
                onClick={() => setMode(opt)}
              >
                {opt === "normal" ? t("standard") : t("stepper")}
              </Button>
            ))}
          </div>

          {mode === "stepper" && (
            <div className="flex items-center gap-0.5 rounded-md border bg-card p-0.5">
              {INDICATOR_OPTIONS.map((opt) => (
                <Button
                  key={opt}
                  variant={indicatorVariant === opt ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-3"
                  onClick={() => setIndicatorVariant(opt)}
                >
                  {opt === "icon" ? tIndicator("icons") : tIndicator("numbers")}
                </Button>
              ))}
            </div>
          )}
        </>
      )}

      {regMode === "minReg" ? (
        <MinRegForm />
      ) : mode === "normal" ? (
        <NormalRegisterForm fieldStatus={fieldStatus} />
      ) : (
        <StepperRegisterForm fieldStatus={fieldStatus} indicatorVariant={indicatorVariant} />
      )}
    </div>
  );
}
