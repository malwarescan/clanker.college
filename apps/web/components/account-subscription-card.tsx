"use client";

import { useState } from "react";
import type { ActiveSubscription } from "@/lib/entitlements";
import { track } from "@/lib/analytics";

type Props = {
  userId: string;
  subscription: ActiveSubscription | null;
};

export function AccountSubscriptionCard({ subscription }: Props) {
  const [loading, setLoading] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const active = subscription !== null;
  const renewsAt = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const startSubscription = async () => {
    setError(null);
    setLoading("checkout");
    track("checkout_start", { plan: "individual_monthly" });
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "individual_monthly" }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error ?? "Checkout failed");
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  };

  const manageBilling = async () => {
    setError(null);
    setLoading("portal");
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error ?? "Could not open billing portal");
    } catch {
      setError("Network error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Subscription</h2>
      {active ? (
        <>
          <p className="mt-2 text-sm text-[var(--ink)]">
            Active — {subscription!.plan.replace(/_/g, " ")}
          </p>
          {renewsAt && (
            <p className="mt-1 text-sm text-[var(--muted)]">Renews on {renewsAt}</p>
          )}
          <button
            type="button"
            onClick={manageBilling}
            disabled={loading !== null}
            className="mt-4 rounded-md border border-[var(--border)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]/50 disabled:opacity-70"
          >
            {loading === "portal" ? "Opening…" : "Manage billing"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-[var(--muted)]">No active subscription</p>
          <button
            type="button"
            onClick={startSubscription}
            disabled={loading !== null}
            className="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
          >
            {loading === "checkout" ? "Redirecting…" : "Start subscription"}
          </button>
        </>
      )}
      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
