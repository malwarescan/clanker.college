import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromClerk } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { packSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { packSlug } = body;
  if (!packSlug || typeof packSlug !== "string") {
    return NextResponse.json({ error: "packSlug required" }, { status: 400 });
  }

  const userId = await getUserIdFromClerk(req);
  if (!userId) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const pack = await prisma.pack.findUnique({
    where: { slug: packSlug },
    include: { product: true },
  });
  if (!pack?.product) {
    return NextResponse.json({ error: "Pack or product not found" }, { status: 404 });
  }

  const product = pack.product as { stripePriceId: string };
  if (!product.stripePriceId) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 400 });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.PUBLIC_BASE_URL ?? "https://clanker.college";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/packs/${pack.slug}?purchased=1`,
      cancel_url: `${baseUrl}/packs/${pack.slug}`,
      metadata: { userId, packId: pack.id },
    });
    return NextResponse.json({ url: session.url ?? null });
  } catch (e) {
    if (e && typeof (e as Error).message === "string") {
      return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
