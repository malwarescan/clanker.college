"use client";

import Link from "next/link";
import { useState } from "react";

const navLinkClass =
  "flex min-h-[44px] items-center text-[var(--ink)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export function HeaderMobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label="Open menu"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-[var(--ink)] hover:bg-[var(--border)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:hidden"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </>
          )}
        </svg>
      </button>
      <div
        id="mobile-nav-menu"
        className="fixed inset-0 top-[3.5rem] z-40 bg-[var(--paper)] md:hidden"
        hidden={!open}
        aria-hidden={!open}
      >
        {open && (
          <nav className="border-t border-[var(--border)] px-4 py-4" aria-label="Main">
            <ul className="flex flex-col gap-1">
              <li><Link href="/catalog" className={navLinkClass} onClick={() => setOpen(false)}>Catalog</Link></li>
              <li><Link href="/schools" className={navLinkClass} onClick={() => setOpen(false)}>Schools</Link></li>
              <li><Link href="/certification" className={navLinkClass} onClick={() => setOpen(false)}>Certification</Link></li>
              <li><Link href="/docs" className={navLinkClass} onClick={() => setOpen(false)}>Docs</Link></li>
              <li><Link href="/account" className={navLinkClass} onClick={() => setOpen(false)}>Account</Link></li>
            </ul>
          </nav>
        )}
      </div>
      {open && (
        <div
          className="fixed inset-0 top-[3.5rem] z-30 bg-black/20 md:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
