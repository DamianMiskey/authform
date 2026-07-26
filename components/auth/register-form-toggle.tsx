"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { NormalRegisterForm, StepperRegisterForm } from "./auth-forms";

const OPTIONS = ["normal", "stepper"] as const;

export function RegisterFormToggle() {
  const t = useTranslations("auth.register.layoutToggle");
  const [mode, setMode] = useState<(typeof OPTIONS)[number]>("normal");

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
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

      {mode === "normal" ? <NormalRegisterForm /> : <StepperRegisterForm />}
    </div>
  );
}
