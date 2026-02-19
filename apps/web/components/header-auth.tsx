"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { getHostedSignInUrl } from "@/lib/clerk-hosted";

/**
 * Account area: Sign in (link to hosted portal or /account) or UserButton when signed in.
 */
const linkClass =
  "min-h-[44px] min-w-[44px] inline-flex items-center text-sm text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function HeaderAuth() {
  return (
    <>
      <SignedOut>
        <Link href={getHostedSignInUrl("/account")} className={linkClass}>
          Sign in
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </SignedIn>
    </>
  );
}
