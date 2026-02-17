import { NextResponse } from "next/server";
import { getPacksWithLatestVersion, getPackAvailability } from "@/lib/packs";
import { getUserIdFromClerk, getEntitlementStatus } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const packs = await getPacksWithLatestVersion();
  const userId = await getUserIdFromClerk(req);

  const list = await Promise.all(
    packs.map(async (p) => {
      const status = await getEntitlementStatus(userId ?? null, p.id);
      const availability = getPackAvailability(
        { product: p.product, latestVersion: p.latestVersion ?? undefined },
        status.locked
      );
      return {
        slug: p.slug,
        title: p.title,
        school_slug: p.schoolSlug,
        version: p.latestVersion!.version,
        last_updated: p.latestVersion!.lastUpdatedAt,
        ...availability,
      };
    })
  );
  return NextResponse.json(list);
}
