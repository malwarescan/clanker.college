import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isClerkEnabled } from "@/lib/clerk-env";
import { useHostedAccountPortal, getHostedSignInUrl } from "@/lib/clerk-hosted";
import { getActiveSubscription } from "@/lib/entitlements";
import { AuthCard } from "@/components/auth-card";
import { AccountGate } from "@/components/account-gate";
import { AccountSubscriptionCard } from "@/components/account-subscription-card";
import { AccountInstallsCard } from "@/components/account-installs-card";
import { AccountCertificatesCard } from "@/components/account-certificates-card";

export const dynamic = "force-dynamic";

type SearchParams = { returnTo?: string };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { returnTo } = await searchParams;
  let clerkUserId: string | null = null;
  try {
    const session = await auth();
    clerkUserId = session.userId ?? null;
  } catch {
    // Clerk not configured or middleware not run
  }

  const useHosted = useHostedAccountPortal();

  if (!clerkUserId) {
    if (useHosted) redirect(getHostedSignInUrl("/account"));
    return (
      <div className="min-h-[60vh]">
        <AuthCard returnTo={returnTo ?? null} clerkEnabled={isClerkEnabled()} />
      </div>
    );
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, email: true, orgId: true },
  });
  if (!user) {
    let email: string | null = null;
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(clerkUserId);
      email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
    } catch {
      // continue without email
    }
    try {
      user = await prisma.user.upsert({
        where: { clerkId: clerkUserId },
        create: { clerkId: clerkUserId, email: email ?? undefined },
        update: email ? { email } : {},
        select: { id: true, email: true, orgId: true },
      });
    } catch {
      if (useHosted) redirect(getHostedSignInUrl("/account"));
      return (
        <div className="min-h-[60vh]">
          <AuthCard returnTo={returnTo ?? null} clerkEnabled={isClerkEnabled()} />
        </div>
      );
    }
  }

  const [subscription, certificates] = await Promise.all([
    getActiveSubscription(user.id),
    user.orgId
      ? prisma.certificate.findMany({
          where: { orgId: user.orgId },
          include: { pack: true, packVersion: true },
          orderBy: { issuedAt: "desc" },
          take: 10,
        })
      : [],
  ]);

  return (
    <AccountGate>
      <div className="mx-auto max-w-read px-[var(--mobile-padding)] py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Account</h1>
        <p className="mt-2 text-[var(--muted)]">Billing, installs, and certificates.</p>

        <div className="mt-10 space-y-8">
          <AccountSubscriptionCard userId={user.id} subscription={subscription} />
          <AccountInstallsCard />
          <AccountCertificatesCard certificates={certificates} />
        </div>
      </div>
    </AccountGate>
  );
}
