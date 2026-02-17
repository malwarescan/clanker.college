import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto max-w-site px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--ink)]">Site</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/catalog" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Catalog</Link></li>
              <li><Link href="/schools" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Schools</Link></li>
              <li><Link href="/certification" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Certification</Link></li>
              <li><Link href="/docs" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Docs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--ink)]">Developer endpoints</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/api/packs" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">List packs</Link></li>
              <li><Link href="/docs/submit-labs" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Grade</Link></li>
              <li><Link href="/docs" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Verify certificate (full surface list in Docs)</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-[var(--ink)]">Legal</h3>
            <ul className="space-y-2 text-sm text-[var(--muted)]">
              <li><Link href="/contact" className="hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">Contact</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-xs text-[var(--muted)]">© Clanker.College</p>
      </div>
    </footer>
  );
}
