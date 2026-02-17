import type { PackVersion } from "@clanker/db";
import { absoluteUrl } from "./base-url";

export function buildLatestResponse(pack: { slug: string; title: string }, v: PackVersion) {
  return {
    slug: pack.slug,
    title: pack.title,
    version: v.version,
    version_id: v.id,
    status: v.status,
    last_updated: v.lastUpdatedAt,
    outcomes: v.outcomesJson,
    urls: {
      install: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/install`),
      rubric: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/rubric`),
      syllabus: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/syllabus`),
      examples: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/examples`),
    },
    versioned_urls: {
      install: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/install`),
      rubric: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/rubric`),
      syllabus: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/syllabus`),
      examples: absoluteUrl(`/api/packs/${pack.slug}/v/${v.version}/examples`),
    },
  };
}
