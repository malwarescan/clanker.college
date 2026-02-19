"use client";

import Link from "next/link";
import { getHostedSignInUrl } from "@/lib/clerk-hosted";

/**
 * Sticky bottom action bar on mobile for /catalog and /packs/[slug].
 * Primary conversion lever: Sign in | Start subscription | Install.
 * Only visible on mobile (md:hidden).
 */
type Variant = "catalog" | "pack";
type InstallState = "signed_out" | "locked" | "entitled";

export function BottomActionBar({
  variant,
  signedIn,
  installState,
  packSlug,
}: {
  variant: Variant;
  signedIn: boolean;
  installState?: InstallState;
  packSlug?: string;
}) {
  const href = packSlug ? `/packs/${packSlug}` : "/catalog";
  const installAnchor = packSlug ? `/packs/${packSlug}#panel-install` : "/catalog";

  let label = "Browse";
  let actionHref = "/catalog";
  let primary = true;

  if (variant === "catalog") {
    if (!signedIn) {
      label = "Sign in";
      actionHref = getHostedSignInUrl("/catalog");
      primary = true;
    } else {
      label = "Browse packs";
      actionHref = "/catalog";
      primary = true;
    }
  } else {
    if (installState === "signed_out") {
      label = "Sign in";
      actionHref = getHostedSignInUrl(installAnchor);
      primary = true;
    } else if (installState === "locked") {
      label = "Start subscription";
      actionHref = installAnchor;
      primary = true;
    } else {
      label = "Install";
      actionHref = installAnchor;
      primary = true;
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--paper)]/95 p-4 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <Link
        href={actionHref}
        className="flex min-h-[44px] w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-3 text-base font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {label}
      </Link>
    </div>
  );
}
