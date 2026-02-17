import Link from "next/link";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1 text-sm" aria-label="Docs">
            <Link href="/docs" className="block text-[var(--muted)] hover:text-[var(--ink)]">Overview</Link>
            <Link href="/docs/getting-started" className="block text-[var(--muted)] hover:text-[var(--ink)]">Getting Started</Link>
            <Link href="/docs/submit-labs" className="block text-[var(--muted)] hover:text-[var(--ink)]">Submitting Labs</Link>
            <Link href="/docs/install" className="block text-[var(--muted)] hover:text-[var(--ink)]">Installing Skill Packs</Link>
          </nav>
        </aside>
        <div className="min-w-0 max-w-read">
          {children}
        </div>
      </div>
    </div>
  );
}
