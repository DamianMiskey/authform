// lib/cms/adapter.ts
//
// The active CMS adapter — shared by both getter modules (getters.ts and
// getters.uncached.ts) so switching providers is still a one-line change.

import { staticAdapter } from "./static-adapter";
// import { sanityAdapter } from "./sanity-adapter";
// import { payloadAdapter } from "./payload-adapter";

// Back on static until Payload is deployed somewhere the build can reach —
// with "use cache" in getters.ts, CMS data is fetched at build time, and the
// payload adapter's PAYLOAD_URL currently points at localhost.
export const adapter = staticAdapter;
// export const adapter = sanityAdapter;
// export const adapter = payloadAdapter;
