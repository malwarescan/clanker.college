import { NextResponse } from "next/server";
import { getUserIdFromClerk } from "@/lib/entitlements";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const PLAN_PRICE_IDS: Record<string, string> = {
  individual_monthly: process.env.STRIPE_PRICE_INDIVIDUAL_MONTHLY ?? "",
  individual_annual: process.env.STRIPE_PRICE_INDIVIDUAL_ANNUAL ?? "",
};

export async function POST(req: Request) {
  const userId = await getUserIdFromClerk(req);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const plan = body.plan;
  if (!plan || typeof plan !== "string" || !PLAN_PRICE_IDS[plan]) {
    return NextResponse.json(
      { error: "Invalid plan. Use individual_monthly or individual_annual" },
      { status: 400 }
    );
  }

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price not configured for this plan" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeCustomerId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://clanker.college";

    const sessionParams: import("stripe").Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/catalog?checkout=success`,
      cancel_url: `${baseUrl}/account`,
      metadata: { userId, plan },
      subscription_data: { metadata: { userId, plan } },
    };
    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else if (user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url ?? null });
  } catch (e) {
    const msg = e && typeof (e as Error).message === "string" ? (e as Error).message : "Checkout failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
