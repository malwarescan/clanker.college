import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Called after Clerk sign-in (redirect URL).
 * Provisions user in DB if new, then redirects to returnTo or /catalog.
 */
export async function GET(req: Request) {
  let clerkUserId: string | null = null;
  try {
    const session = await auth();
    clerkUserId = session.userId ?? null;
  } catch {
    // Clerk not ready — send to account
  }
  const url = new URL(req.url);
  const returnTo = url.searchParams.get("returnTo")?.trim() || "/catalog";
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://clanker.college";
  const allowedHost = new URL(base).origin;
  const redirectUrl = returnTo.startsWith("/") ? `${allowedHost}${returnTo}` : `${allowedHost}/catalog`;

  if (!clerkUserId) {
    return NextResponse.redirect(`${allowedHost}/account`);
  }

  let email: string | null = null;
  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
  } catch {
    // continue without email
  }
  try {
    await prisma.user.upsert({
      where: { clerkId: clerkUserId },
      create: { clerkId: clerkUserId, email: email ?? undefined },
      update: email ? { email } : {},
    });
  } catch {
    // continue to redirect even if upsert fails (e.g. DB down)
  }

  return NextResponse.redirect(redirectUrl);
}
