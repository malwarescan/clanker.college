import { NextResponse } from "next/server";
import { getUserIdFromClerk } from "@/lib/entitlements";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await getUserIdFromClerk();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account. Start a subscription first." },
      { status: 400 }
    );
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clanker.college";

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/account`,
    });
    return NextResponse.json({ url: session.url ?? null });
  } catch (e) {
    const msg = e && typeof (e as Error).message === "string" ? (e as Error).message : "Portal failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
