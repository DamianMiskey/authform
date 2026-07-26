"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// Thin wrapper only exists to be an explicit Client Component boundary —
// next-themes needs to read/write document.documentElement's class and
// localStorage, neither of which can happen in a Server Component.
export function ThemeProvider({
  children,
  ...props
}: Readonly<ComponentProps<typeof NextThemesProvider>>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
