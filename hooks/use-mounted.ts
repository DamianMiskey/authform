// hooks/use-mounted.ts
//
// Client/server value divergence (has the app hydrated yet?) without a
// setState-in-effect — useSyncExternalStore's getServerSnapshot/getSnapshot
// split is exactly what this is for: false during SSR and the first
// client render, true from the next render on, with no extra effect and
// no cascading re-render beyond the one hydration already causes.

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
