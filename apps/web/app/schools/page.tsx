import Link from "next/link";

export default function SchoolsPage() {
  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Schools</h1>
      <p className="mt-2 text-[var(--muted)]">Skill Packs by school.</p>
      <ul className="mt-6 space-y-4">
        <li>
          <Link href="/catalog?school=school-of-design" className="font-medium text-[var(--accent)] hover:underline">
            School of Design
          </Link>
          <p className="text-sm text-[var(--muted)]">Design system architecture and UI discipline.</p>
        </li>
      </ul>
    </div>
  );
}
