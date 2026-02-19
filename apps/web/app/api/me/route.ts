import { NextResponse } from "next/server";
import { getUserIdFromClerk, getActiveSubscription } from "@/lib/entitlements";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserIdFromClerk();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const [user, entitlement] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, orgId: true },
    }),
    getActiveSubscription(userId),
  ]);

  const u = user ?? null;
  if (!u) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const certificates = u.orgId
    ? await prisma.certificate.findMany({
        where: { orgId: u.orgId },
        orderBy: { issuedAt: "desc" },
        take: 10,
        include: { pack: true, packVersion: true },
      })
    : [];

  return NextResponse.json({
    user: { id: u.id, email: u.email },
    entitlement: entitlement
      ? {
          status: entitlement.status,
          plan: entitlement.plan,
          currentPeriodEnd: entitlement.currentPeriodEnd?.toISOString() ?? null,
        }
      : null,
    certificates: certificates.map((c) => ({
      id: c.id,
      packTitle: c.pack?.title,
      version: c.packVersion?.version,
      scoreTotal: c.scoreTotal,
      issuedAt: c.issuedAt.toISOString(),
    })),
  });
}
