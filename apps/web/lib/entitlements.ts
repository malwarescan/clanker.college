import { prisma } from "./db";

/**
 * Resolve current user ID from Clerk (server-side).
 * Call with no args from Server Components (auth() uses cookies). Pass req from Route Handlers.
 * Install @clerk/nextjs and map Clerk user to internal User by clerkId. Until then, returns null.
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

/** Active = status is active AND (expires_at is null OR expires_at > now). */
export async function hasActiveEntitlement(userId: string, packId: string): Promise<boolean> {
  const now = new Date();
  const e = await prisma.entitlement.findUnique({
    where: { userId_packId: { userId, packId } },
  });
  if (!e || e.status !== "active") return false;
  if (e.expiresAt && e.expiresAt <= now) return false;
  return true;
}

export async function getEntitlementStatus(
  userId: string | null,
  packId: string
): Promise<{ locked: boolean; source: string | null; expiresAt: Date | null }> {
  if (!userId) return { locked: true, source: null, expiresAt: null };
  const e = await prisma.entitlement.findUnique({
    where: { userId_packId: { userId, packId } },
  });
  if (!e || e.status !== "active") return { locked: true, source: null, expiresAt: null };
  if (e.expiresAt && e.expiresAt <= new Date()) return { locked: true, source: e.source, expiresAt: e.expiresAt };
  return { locked: false, source: e.source, expiresAt: e.expiresAt };
}
