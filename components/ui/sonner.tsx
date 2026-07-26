"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Thin wrapper so toasts pick up next-themes' resolved theme and this
// app's actual popover/border tokens, instead of sonner's own
// light-only defaults.
function Toaster({ ...props }: Readonly<ToasterProps>) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          // --color-* (not the raw --popover/--border HSL triplets) —
          // Tailwind v4's `@theme inline` block already wraps those in
          // hsl(...) when it registers them, so these resolve to valid
          // CSS colors directly.
          "--normal-bg": "var(--color-popover)",
          "--normal-text": "var(--color-popover-foreground)",
          "--normal-border": "var(--color-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
