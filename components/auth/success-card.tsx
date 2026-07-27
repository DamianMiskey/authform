// components/auth/success-card.tsx
//
// Post-submit state shared by every form (Normal/Stepper register,
// MinReg, Login) — each resolves its own title/description via its own
// t() namespace and interpolation params, then hands the resulting
// strings here.

import { Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function SuccessCard({
  title,
  description,
}: Readonly<{ title: string; description: string }>) {
  return (
    <Card className="w-full max-w-xl">
      <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
        <div className="rounded-full bg-emerald-100 p-3">
          <Check className="h-6 w-6 text-emerald-600" />
        </div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
