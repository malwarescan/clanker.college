import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }
  let event: { type: string; data: { object: { metadata?: { userId?: string; packId?: string } } } };
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET) as typeof event;
  } catch (e) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const meta = event.data.object.metadata;
    const userId = meta?.userId;
    const packId = meta?.packId;
    if (!userId || !packId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }
    await prisma.entitlement.upsert({
      where: { userId_packId: { userId, packId } },
      create: { userId, packId, status: "active", source: "stripe" },
      update: { status: "active", source: "stripe" },
    });
  }
  return NextResponse.json({ received: true });
}
