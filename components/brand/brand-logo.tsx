"use client";

import Image from "next/image";

import { useBrand } from "./brand-provider";

export function BrandLogo() {
  const { brand } = useBrand();

  return (
    <div className="flex items-center gap-2 pb-2">
      {brand.logo.imageUrl ? (
        <Image
          src={brand.logo.imageUrl}
          alt={brand.name}
          width={120}
          height={32}
          unoptimized
          className="h-8 w-auto"
        />
      ) : (
        <>
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {brand.logo.text.charAt(0)}
          </span>
          <span className="text-sm font-bold tracking-wide text-foreground">
            {brand.logo.text}
          </span>
        </>
      )}
    </div>
  );
}
