"use client";

import { SignIn } from "@clerk/nextjs";

type AuthCardProps = {
  returnTo?: string | null;
  /** When true, layout has ClerkProvider; safe to render SignIn. When false, show "not configured". Prefer passing from server (isClerkEnabled()). */
  clerkEnabled?: boolean;
};

/**
 * Single centered card: Google + magic link. No passwords.
 * Only render SignIn when clerkEnabled is true (server says we're inside ClerkProvider).
 */
export function AuthCard({ returnTo, clerkEnabled = false }: AuthCardProps) {
  const redirectUrl = returnTo
    ? `/auth/callback?returnTo=${encodeURIComponent(returnTo)}`
    : "/auth/callback";

  if (!clerkEnabled) {
    return (
      <div className="mx-auto max-w-[440px] px-4 py-10 sm:px-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--ink)]">Sign in to Clanker.College</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Access packs, installs, and certificates.
          </p>
          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <p className="font-medium">Sign-in not configured</p>
            <p className="mt-1">
              Set <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900">NEXT_PUBLIC_CLERK_ENABLED=true</code> and a valid{" "}
              <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> (starts with <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900">pk_test_</code> or <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900">pk_live_</code>) in{" "}
              <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900">.env.local</code> in <strong>apps/web</strong> (so Next.js loads it). Or at repo root if you use the root env. Get the key from your{" "}
              <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="underline">Clerk dashboard</a>. Use exactly <code className="rounded bg-amber-100 px-1 font-mono dark:bg-amber-900">true</code> (no quotes) and restart the dev server.
            </p>
            <p className="mt-2 text-xs">
              In dev you can check what the server sees: <a href="/api/debug/clerk-env" target="_blank" rel="noreferrer" className="underline">/api/debug/clerk-env</a>
            </p>
          </div>
          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            No passwords. Secure sign-in links.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[440px] px-4 py-6 sm:px-6 sm:py-10">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-4 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Sign in to Clanker.College</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Access packs, installs, and certificates.
        </p>
        <div className="auth-card-clerk mt-6 w-full min-w-0">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full min-w-0 max-w-full",
                card: "w-full max-w-full shadow-none p-0",
                header: "hidden",
                socialButtonsBlockButton: "border-[var(--border)] text-[var(--ink)]",
                formButtonPrimary: "bg-[var(--accent)] hover:opacity-90",
                footer: "hidden",
                dividerLine: "bg-[var(--border)]",
                dividerText: "text-[var(--muted)]",
                formFieldInput: "border-[var(--border)]",
                identityPreviewEditButton: "text-[var(--accent)]",
              },
              variables: {
                colorPrimary: "var(--accent)",
                colorText: "var(--ink)",
                colorTextSecondary: "var(--muted)",
                colorBackground: "var(--paper)",
                colorInputBackground: "var(--paper)",
                borderRadius: "0.375rem",
              },
            }}
            forceRedirectUrl={redirectUrl}
            fallbackRedirectUrl="/catalog"
            signUpFallbackRedirectUrl="/catalog"
          />
        </div>
        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          No passwords. Secure sign-in links.
        </p>
      </div>
    </div>
  );
}
