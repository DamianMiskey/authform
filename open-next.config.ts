import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache override yet — "use cache" / ISR entries live only for
// the life of a Worker isolate. Add an R2 bucket (r2IncrementalCache) if
// cached CMS data needs to persist across isolates/deploys.
export default defineCloudflareConfig({});
