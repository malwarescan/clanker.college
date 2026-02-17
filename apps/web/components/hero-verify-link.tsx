"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

export function HeroVerifyLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      onClick={() => track("hero_verify_click")}
    >
      Verify certificate
    </Link>
  );
}
