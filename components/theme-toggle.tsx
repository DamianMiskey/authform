"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

const OPTIONS = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // next-themes can't know the resolved theme on the server (it depends
  // on localStorage/matchMedia, both client-only), so this avoids
  // rendering theme-dependent UI until after mount — same reason the
  // layout needs suppressHydrationWarning.
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-0.5 rounded-md border bg-card p-0.5">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <Button
            key={opt.value}
            variant={active ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setTheme(opt.value)}
            aria-label={opt.label}
            title={opt.label}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        );
      })}
    </div>
  );
}
