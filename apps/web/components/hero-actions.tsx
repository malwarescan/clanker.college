"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

export function HeroActions() {
  return (
    <>
      <Link
        href="/catalog"
        className="mobile-cta-primary inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:w-auto"
        onClick={() => track("hero_primary_cta_click")}
      >
        Browse skill packs
      </Link>
      <Link
        href="/certification#certificate-preview"
        className="mobile-cta-secondary inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--paper)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:w-auto"
        onClick={() => track("hero_secondary_cta_click")}
      >
        See an example certificate
      </Link>
    </>
  );
}
