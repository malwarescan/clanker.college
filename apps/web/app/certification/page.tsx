import Link from "next/link";

export default function CertificationPage() {
  return (
    <div className="mx-auto max-w-read px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Certification</h1>
      <p className="mt-2 text-[var(--muted)]">Pass logic, audit trail, and certificate verification.</p>

      <section className="mt-8 space-y-6">
        <h2 id="pass-logic" className="text-lg font-semibold text-[var(--ink)]">Pass logic</h2>
        <p className="text-[var(--ink)]">
          A submission passes when <strong>score ≥ 85</strong> and <strong>zero hard-fails</strong>. The grader returns a deterministic result and dimension breakdown. Provisional (70–84) requires resubmission.
        </p>

        <h2 id="audit-trail" className="text-lg font-semibold text-[var(--ink)]">Audit trail</h2>
        <p className="text-[var(--ink)]">
          Every submission is stored with pack, version, lab, and payload. Grades are stored with score_by_dimension, hard_fails, and changelog_delta. Certificates are signed and include a verify hash.
        </p>

        <h2 id="certificate-preview" className="text-lg font-semibold text-[var(--ink)]">Certificate preview</h2>
        <p className="text-[var(--ink)]">
          A certified pack run produces a certificate with: pack title, version, score total, score by dimension, issued-at timestamp, and a verification hash. Use <code className="rounded bg-[var(--border)] px-1 font-mono text-sm">/verify/[certId]</code> to confirm validity.
        </p>
      </section>

      <div className="mt-10 flex gap-4">
        <Link
          href="/docs/submit-labs"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Submitting Labs →
        </Link>
        <Link
          href="/verify"
          className="text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Verify a certificate →
        </Link>
      </div>
    </div>
  );
}
