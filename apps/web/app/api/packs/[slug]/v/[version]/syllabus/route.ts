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
  const md = v.syllabusMd ?? "";
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    ...versionedCacheHeaders(v.id),
  });
  const reqEtag = req.headers.get("if-none-match");
  const etag = headers.get("ETag");
  if (reqEtag && etag && reqEtag === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(md, { headers });
}
