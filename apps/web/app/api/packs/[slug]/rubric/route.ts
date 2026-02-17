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
  const rubric = v?.rubricJson ?? null;
  if (!rubric || !v) {
    return NextResponse.json({ error: "Rubric not found" }, { status: 404 });
  }
  const headers = new Headers(agentCacheHeaders(v.id, v.lastUpdatedAt));
  headers.set("Content-Type", "application/json");
  const reqEtag = req.headers.get("if-none-match");
  const etag = headers.get("ETag");
  if (reqEtag && etag && reqEtag === etag) {
    return new NextResponse(null, { status: 304, headers });
  }
  return new NextResponse(JSON.stringify(rubric), { headers });
}
