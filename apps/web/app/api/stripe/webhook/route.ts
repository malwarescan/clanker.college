import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  current_period_end: number;
  metadata?: { userId?: string; plan?: string };
};

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }
  let event: {
    type: string;
    data: {
      object: {
        metadata?: { userId?: string; packId?: string; plan?: string };
        mode?: string;
        customer?: string;
        subscription?: string;
        id?: string;
        current_period_end?: number;
        status?: string;
      };
    };
  };
  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    ) as typeof event;
  } catch (e) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const obj = event.data.object;

  if (event.type === "checkout.session.completed") {
    const meta = obj.metadata;
    const userId = meta?.userId;
    const packId = meta?.packId;
    const plan = meta?.plan;

    if (obj.mode === "subscription" && userId && plan && obj.customer && obj.subscription) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await prisma.user.updateMany({
        where: { id: userId },
        data: { stripeCustomerId: obj.customer as string },
      });
      const sub = await stripe.subscriptions.retrieve(obj.subscription as string);
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;
      await prisma.subscription.upsert({
        where: {
          userId_plan: { userId, plan },
        },
        create: {
          userId,
          plan,
          status: sub.status === "active" ? "active" : sub.status ?? "active",
          stripeCustomerId: obj.customer as string,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: periodEnd,
        },
        update: {
          status: sub.status === "active" ? "active" : sub.status ?? "active",
          stripeCustomerId: obj.customer as string,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: periodEnd,
        },
      });
    } else if (userId && packId) {
      await prisma.entitlement.upsert({
        where: { userId_packId: { userId, packId } },
        create: { userId, packId, status: "active", source: "stripe" },
        update: { status: "active", source: "stripe" },
      });
    }
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = obj as unknown as StripeSubscription;
    const userId = sub.metadata?.userId;
    const plan = sub.metadata?.plan;
    if (!userId || !plan) return NextResponse.json({ received: true });
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null;
    const status =
      sub.status === "active"
        ? "active"
        : sub.status === "past_due"
          ? "past_due"
          : sub.status === "canceled"
            ? "canceled"
            : sub.status;
    await prisma.subscription.upsert({
      where: { userId_plan: { userId, plan } },
      create: {
        userId,
        plan,
        status,
        stripeCustomerId: sub.customer,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: periodEnd,
      },
      update: {
        status,
        stripeCustomerId: sub.customer,
        stripeSubscriptionId: sub.id,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = obj as unknown as StripeSubscription;
    const userId = sub.metadata?.userId;
    const plan = sub.metadata?.plan;
    if (!userId || !plan) return NextResponse.json({ received: true });
    const periodEnd = sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null;
    await prisma.subscription.updateMany({
      where: { userId, plan },
      data: { status: "canceled", currentPeriodEnd: periodEnd },
    });
  }

  return NextResponse.json({ received: true });
}
