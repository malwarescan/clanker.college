import { NextResponse } from "next/server";
import { getPackBySlug } from "@/lib/packs";
import { getUserIdFromClerk, hasAccessToPack } from "@/lib/entitlements";
import { absoluteUrl } from "@/lib/base-url";

/** Entitlement-gated install: returns artifact URLs and instructions only when entitled (or pack does not require purchase). */
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });
  const v = pack.latestVersion;
  if (!v) return NextResponse.json({ error: "No certified version" }, { status: 404 });

  const userId = await getUserIdFromClerk(req);
  const requiresPurchase = !!pack.product;

  if (requiresPurchase) {
    if (!userId) {
      return NextResponse.json(
        {
          error: "ENTITLEMENT_REQUIRED",
          packSlug: pack.slug,
          packName: pack.title,
          stripePriceId: (pack.product as { stripePriceId?: string } | null)?.stripePriceId ?? null,
          message: "Sign in and purchase this pack to access install artifacts.",
        },
        { status: 403 }
      );
    }
    const entitled = await hasAccessToPack(userId, pack.id);
    if (!entitled) {
      return NextResponse.json(
        {
          error: "ENTITLEMENT_REQUIRED",
          plan: "individual",
          packSlug: pack.slug,
          packName: pack.title,
          stripePriceId: (pack.product as { stripePriceId?: string } | null)?.stripePriceId ?? null,
          message: "Start a subscription or purchase this pack to access install artifacts.",
        },
        { status: 403 }
      );
    }
  }

  const base = absoluteUrl("");
  const zipUrl = v.artifactZipUrl ?? null;
  const pluginZipUrl = v.artifactPluginUrl ?? null;
  const openclawConfigSnippet = {
    skillPaths: [`.claude/skills/${pack.slug}`],
    comment: `Add to openclaw.json for pack ${pack.slug} v${v.version}`,
  };

  const installInstructions = {
    claude_skills: [
      "Download the ZIP (link below).",
      "Unzip into .claude/skills/ (user or project).",
      "Restart Claude Code / reload skills.",
    ],
    claude_plugin: pluginZipUrl
      ? [
          "Download the plugin ZIP.",
          "Install via local plugin path or repo URL.",
        ]
      : [],
    openclaw: [
      "Add the skill path to your openclaw.json skillPaths.",
      "Use the JSON snippet below.",
    ],
  };

  return NextResponse.json({
    packSlug: pack.slug,
    version: v.version,
    zipUrl: zipUrl ? (zipUrl.startsWith("http") ? zipUrl : base + zipUrl) : null,
    pluginZipUrl: pluginZipUrl ? (pluginZipUrl.startsWith("http") ? pluginZipUrl : base + pluginZipUrl) : null,
    openclawConfigSnippet,
    installInstructions,
  });
}
