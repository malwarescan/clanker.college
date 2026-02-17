import { NextResponse } from "next/server";
import { getPackBySlug } from "@/lib/packs";
import { buildLatestResponse } from "@/lib/pack-api-response";
import { LATEST_CACHE_CONTROL } from "@/lib/agent-cache";

/** Latest certified = highest SemVer where certified_at is not null. Same as /latest. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack?.latestVersion) {
    return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  }
  const body = buildLatestResponse(pack, pack.latestVersion);
  return NextResponse.json(body, {
    headers: { "Cache-Control": LATEST_CACHE_CONTROL },
  });
}
