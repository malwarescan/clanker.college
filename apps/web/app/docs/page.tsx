import Link from "next/link";

export default function DocsIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Docs</h1>
      <p className="mt-2 text-[var(--muted)]">Clanker.College method and APIs.</p>
      <ul className="mt-6 space-y-4">
        <li>
          <Link href="/docs/getting-started" className="font-medium text-[var(--accent)] hover:underline">
            Getting Started
          </Link>
          <p className="text-sm text-[var(--muted)]">The Clanker philosophy and operator workflow.</p>
        </li>
        <li>
          <Link href="/docs/submit-labs" className="font-medium text-[var(--accent)] hover:underline">
            Submitting Labs
          </Link>
          <p className="text-sm text-[var(--muted)]">Grading loop and submission format.</p>
        </li>
        <li>
          <Link href="/docs/install" className="font-medium text-[var(--accent)] hover:underline">
            Installing Skill Packs
          </Link>
          <p className="text-sm text-[var(--muted)]">Manual and programmatic installation.</p>
        </li>
      </ul>
    </div>
  );
}
