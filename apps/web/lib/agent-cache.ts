import { createHash } from "crypto";

/** For /latest and /certified/latest: short TTL so new certifications are visible quickly. */
export const LATEST_CACHE_CONTROL =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=600";

/** For versioned endpoints (/v/1.0.0/*): immutable, long-lived. ETag from version_id only. */
const VERSIONED_CACHE_CONTROL = "public, max-age=300, s-maxage=604800, immutable";

const LEGACY_CACHE_CONTROL =
  "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800";

export function agentCacheHeaders(versionId: string, updatedAt: Date): HeadersInit {
  const etag = createHash("sha256")
    .update(`${versionId}-${updatedAt.toISOString()}`)
    .digest("hex");
  return {
    "Cache-Control": LEGACY_CACHE_CONTROL,
    ETag: `"${etag}"`,
  };
}

/** Versioned routes: ETag from version_id only (stable for audit/cache). */
export function versionedCacheHeaders(versionId: string): HeadersInit {
  const etag = createHash("sha256").update(versionId).digest("hex");
  return {
    "Cache-Control": VERSIONED_CACHE_CONTROL,
    ETag: `"${etag}"`,
  };
}
