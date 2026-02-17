import { NextResponse } from "next/server";
import { getPackVersionBySlugAndVersion } from "@/lib/packs";
import { versionedCacheHeaders } from "@/lib/agent-cache";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params;
  const result = await getPackVersionBySlugAndVersion(slug, version);
  if (!result) return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
  const v = result.version;
  const rubric = v.rubricJson ?? null;
  if (!rubric) return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
  const headers = new Headers(versionedCacheHeaders(v.id));
  headers.set("Content-Type", "application/json");
  const reqEtag = req.headers.get("if-none-match");
  const etag = headers.get("ETag");
  if (reqEtag && etag && reqEtag === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(JSON.stringify(rubric), { headers });
}
