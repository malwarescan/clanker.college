"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";

/**
 * Gates /account content: show children when signed in, "Redirecting…" when signed out.
 * Middleware redirects unauthenticated users to hosted sign-in; this handles the brief client state.
 */
export function AccountGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="flex min-h-[40vh] items-center justify-center text-[var(--muted)]">
          Redirecting…
        </div>
      </SignedOut>
    </>
  );
}
