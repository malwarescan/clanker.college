import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-site items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
          <Image
            src="/Clanker-College_Logo1.png"
            alt="Clanker.College"
            width={120}
            height={28}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main">
          <Link href="/catalog" className="text-sm text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
            Catalog
          </Link>
          <Link href="/schools" className="text-sm text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
            Schools
          </Link>
          <Link href="/certification" className="text-sm text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
            Certification
          </Link>
          <Link href="/docs" className="text-sm text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            Browse packs
          </Link>
          <Link href="/account" className="text-sm text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
