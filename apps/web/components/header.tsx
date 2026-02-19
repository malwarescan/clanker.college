import Link from "next/link";
import Image from "next/image";
import { isClerkEnabled } from "@/lib/clerk-env";
import { getHostedSignInUrl } from "@/lib/clerk-hosted";
import { HeaderAuth } from "@/components/header-auth";
import { HeaderMobileNav } from "@/components/header-mobile-nav";

const navLinkClass =
  "min-h-[44px] min-w-[44px] inline-flex items-center text-sm text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function Header() {
  const clerkEnabled = isClerkEnabled();
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="mx-auto flex min-h-14 max-w-site items-center justify-between gap-4 px-[var(--mobile-padding)] py-3 sm:px-6">
        {/* Left: brand + mobile hamburger */}
        <div className="flex shrink-0 items-center gap-2">
          <HeaderMobileNav />
          <Link href="/" className="flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]" aria-label="Clanker.College home">
            <Image
              src="/Clanker-College_Logo1.png"
              alt=""
              width={120}
              height={28}
              className="h-7 w-auto object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>
        </div>

        {/* Center: primary nav (visible on md+) */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block" aria-label="Main">
          <ul className="flex items-center gap-8">
            <li><Link href="/catalog" className={navLinkClass}>Catalog</Link></li>
            <li><Link href="/schools" className={navLinkClass}>Schools</Link></li>
            <li><Link href="/certification" className={navLinkClass}>Certification</Link></li>
            <li><Link href="/docs" className={navLinkClass}>Docs</Link></li>
          </ul>
        </nav>

        {/* Right: primary CTA (Browse) + account */}
        <div className="flex shrink-0 items-center gap-4 sm:gap-6">
          <Link
            href="/catalog"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Browse
          </Link>
          {clerkEnabled ? (
            <HeaderAuth />
          ) : (
            <Link href={getHostedSignInUrl("/account")} className={navLinkClass}>
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
