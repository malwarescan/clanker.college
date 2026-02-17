import { NextResponse } from "next/server";
import { getPackVersionBySlugAndVersion } from "@/lib/packs";
import { versionedCacheHeaders } from "@/lib/agent-cache";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  const { slug, version } = await params;
  const result = await getPackVersionBySlugAndVersion(slug, version);
  if (!result) return new NextResponse("Not found", { status: 404 });
  const v = result.version;
  const examples = v.examples?.[0]?.examplesNdjson ?? "";
  const headers = new Headers(versionedCacheHeaders(v.id));
  headers.set("Content-Type", "application/x-ndjson; charset=utf-8");
  const reqEtag = req.headers.get("if-none-match");
  const etag = headers.get("ETag");
  if (reqEtag && etag && reqEtag === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(examples, { headers });
}
