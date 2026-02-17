import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-read px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Contact</h1>
      <p className="mt-2 text-[var(--muted)]">
        For institutional or partnership inquiries, reach out via your preferred channel.
      </p>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Docs and API reference: <Link href="/docs" className="text-[var(--accent)] hover:underline">Docs</Link>.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline">
        ← Home
      </Link>
    </div>
  );
}
