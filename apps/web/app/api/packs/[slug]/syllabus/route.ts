import { NextResponse } from "next/server";
import { getPackBySlug } from "@/lib/packs";
import { agentCacheHeaders } from "@/lib/agent-cache";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  const v = pack?.latestVersion;
  const md = v?.syllabusMd ?? "";
  if (!v) {
    return new NextResponse("Not found", { status: 404 });
  }
  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    ...agentCacheHeaders(v.id, v.lastUpdatedAt),
  });
  const reqEtag = req.headers.get("if-none-match");
  const etag = headers.get("ETag");
  if (reqEtag && etag && reqEtag === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(md, { headers });
}
