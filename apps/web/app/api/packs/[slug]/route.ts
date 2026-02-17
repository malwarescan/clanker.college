import { NextResponse } from "next/server";
import { getPackBySlug, getPackAvailability } from "@/lib/packs";
import { getUserIdFromClerk, getEntitlementStatus } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const pack = await getPackBySlug(slug);
  if (!pack) return NextResponse.json({ error: "Pack not found" }, { status: 404 });

  const userId = await getUserIdFromClerk(req);
  const status = await getEntitlementStatus(userId ?? null, pack.id);
  const availability = getPackAvailability(
    { product: pack.product, latestVersion: pack.latestVersion ?? undefined },
    status.locked
  );

  const product = pack.product as { stripePriceId?: string } | null | undefined;
  return NextResponse.json({
    slug: pack.slug,
    title: pack.title,
    school_slug: pack.schoolSlug,
    summary: pack.summary,
    latest_version: pack.latestVersion?.version ?? null,
    ...availability,
    stripe_price_id: availability.requiresPurchase ? product?.stripePriceId ?? null : null,
  });
}
