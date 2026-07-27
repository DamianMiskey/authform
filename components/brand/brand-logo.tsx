"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

import { useBrand } from "./brand-provider";

const SIZES = {
  // Used in form CardHeaders.
  default: {
    width: 160,
    height: 44,
    imageClass: "h-10 w-auto",
    iconClass: "h-10 w-10 text-base",
    textClass: "text-base",
  },
  // Used standalone in the footer, where the logo is the focal element.
  lg: {
    width: 220,
    height: 88,
    imageClass: "h-16 w-auto",
    iconClass: "h-16 w-16 text-2xl",
    textClass: "text-2xl",
  },
} as const;

export function BrandLogo({
  size = "default",
  className,
}: Readonly<{ size?: keyof typeof SIZES; className?: string }> = {}) {
  const { brand } = useBrand();
  const s = SIZES[size];

  return (
    <div className={cn("flex items-center gap-2 pb-2", className)}>
      {brand.logo.imageUrl ? (
        <Image
          src={brand.logo.imageUrl}
          alt={brand.name}
          width={s.width}
          height={s.height}
          unoptimized
          className={s.imageClass}
        />
      ) : (
        <>
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground",
              s.iconClass
            )}
            aria-hidden="true"
          >
            {brand.logo.text.charAt(0)}
          </span>
          <span className={cn("font-bold tracking-wide text-foreground", s.textClass)}>
            {brand.logo.text}
          </span>
        </>
      )}
    </div>
  );
}
