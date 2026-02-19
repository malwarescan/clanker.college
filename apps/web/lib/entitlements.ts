import { prisma } from "./db";

export type ActiveSubscription = {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: Date | null;
};

/**
 * Resolve current user ID from Clerk (server-side).
 * Returns internal User.id (not Clerk id) for DB relations.
 */
export async function getUserIdFromClerk(req?: Request): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** Get Clerk user ID (for Stripe metadata, etc.). */
export async function getClerkUserId(req?: Request): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

/** Active subscription: status === "active" OR (status === "canceled" AND currentPeriodEnd > now). */
export async function getActiveSubscription(userId: string): Promise<ActiveSubscription | null> {
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      OR: [
        { status: "active" },
        { status: "canceled", currentPeriodEnd: { gt: now } },
      ],
    },
    orderBy: { currentPeriodEnd: "desc" },
  });
  if (!sub) return null;
  return {
    id: sub.id,
    plan: sub.plan,
    status: sub.status,
    currentPeriodEnd: sub.currentPeriodEnd,
  };
}

/** Per-pack entitlement: active and not expired. */
export async function hasActiveEntitlement(userId: string, packId: string): Promise<boolean> {
  const now = new Date();
  const e = await prisma.entitlement.findUnique({
    where: { userId_packId: { userId, packId } },
  });
  if (!e || e.status !== "active") return false;
  if (e.expiresAt && e.expiresAt <= now) return false;
  return true;
}

/** User can access pack if they have active subscription (all packs) OR per-pack entitlement. */
export async function hasAccessToPack(userId: string, packId: string): Promise<boolean> {
  const [sub, packEntitlement] = await Promise.all([
    getActiveSubscription(userId),
    hasActiveEntitlement(userId, packId),
  ]);
  return sub !== null || packEntitlement;
}

export async function getEntitlementStatus(
  userId: string | null,
  packId: string
): Promise<{ locked: boolean; source: string | null; expiresAt: Date | null; subscription?: ActiveSubscription | null }> {
  if (!userId) return { locked: true, source: null, expiresAt: null, subscription: null };
  const [sub, e] = await Promise.all([
    getActiveSubscription(userId),
    prisma.entitlement.findUnique({ where: { userId_packId: { userId, packId } } }),
  ]);
  if (sub) return { locked: false, source: "subscription", expiresAt: sub.currentPeriodEnd, subscription: sub };
  if (!e || e.status !== "active") return { locked: true, source: null, expiresAt: null, subscription: null };
  if (e.expiresAt && e.expiresAt <= new Date()) return { locked: true, source: e.source, expiresAt: e.expiresAt, subscription: null };
  return { locked: false, source: e.source, expiresAt: e.expiresAt, subscription: null };
}
