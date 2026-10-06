"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLivePreview } from "@payloadcms/live-preview-react";

import type { Brand } from "@/lib/cms/types";

import { useBrand } from "./brand-provider";

const PAYLOAD_URL = process.env.NEXT_PUBLIC_PAYLOAD_URL ?? "http://localhost:3001";

function LivePreviewBrandSyncInner() {
  const searchParams = useSearchParams();
  const livePreviewSlug = searchParams.get("livePreviewBrand");
  const { brands, setBrandId, setLivePreviewOverride } = useBrand();

  const initialBrand = brands.find((b) => b.id === livePreviewSlug) ?? brands[0];

  // Inert (no network activity, `data` stays === initialData) unless this
  // page is actually rendered inside Payload's Live Preview iframe, which
  // is the only place that posts the messages this hook listens for.
  const { data } = useLivePreview<Brand>({
    serverURL: PAYLOAD_URL,
    initialData: initialBrand,
    depth: 2,
  });

  useEffect(() => {
    if (!livePreviewSlug) return;
    setBrandId(livePreviewSlug);
    setLivePreviewOverride(data);
    return () => setLivePreviewOverride(null);
  }, [livePreviewSlug, data, setBrandId, setLivePreviewOverride]);

  return null;
}

/**
 * Renders nothing and does nothing for normal visitors. Only activates
 * when the page is loaded with `?livePreviewBrand=<slug>` — the URL
 * Payload's Brands collection livePreview.url puts in its preview iframe
 * (see authform-cms/src/collections/Brands.ts).
 *
 * Wrapped in its own Suspense boundary (fallback: null) so useSearchParams()
 * here can't force the rest of the static register/login shell into
 * dynamic rendering — same isolation pattern as TrustBadgesDynamic /
 * RegisterFormData use for their own per-request data.
 */
export function LivePreviewBrandSync() {
  return (
    <Suspense fallback={null}>
      <LivePreviewBrandSyncInner />
    </Suspense>
  );
}
