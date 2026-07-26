"use client";

import { Check, ChevronDown, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useBrand } from "./brand-provider";

export function BrandSwitcher() {
  const { brand, brands, setBrandId } = useBrand();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-3.5 w-3.5" />
          {brand.name}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {brands.map((b) => (
          <DropdownMenuItem
            key={b.id}
            onClick={() => setBrandId(b.id)}
            className="gap-2"
          >
            <span
              className="h-3 w-3 shrink-0 rounded-full border border-black/10"
              style={{ backgroundColor: `hsl(${b.colors.primary})` }}
            />
            {b.name}
            {b.id === brand.id && <Check className="ml-auto h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
