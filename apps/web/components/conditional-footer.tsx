"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";

/**
 * Hide footer on auth page (/account) so the sign-in experience is distraction-free.
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/account")) return null;
  return <Footer />;
}
