import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { CertifiedStamp } from "@/components/certified-stamp";
import { getBaseUrl } from "@/lib/base-url";

export default async function VerifyPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { id: certId },
    include: { pack: true, packVersion: true },
  });
  if (!cert) notFound();

  const scoreByDim = cert.scoreByDimensionJson as Record<string, number> | null;
  const base = getBaseUrl();
  const slug = cert.pack.slug;
  const semver = cert.packVersion.version;
  const versionedPackUrl = `${base}/packs/${slug}`;
  const versionedApi = `${base}/api/packs/${slug}/v/${semver}`;

  return (
    <div className="mx-auto max-w-read px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Certificate verification</h1>
      <p className="mt-2 text-[var(--muted)]">Certificate ID: {cert.id}</p>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-[var(--ink)]">{cert.pack.title}</h2>
          <CertifiedStamp version={cert.packVersion.version} />
        </div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pack version: <strong>{semver}</strong> (ID: <code className="text-xs">{cert.packVersionId}</code>)
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">Issued {new Date(cert.issuedAt).toLocaleString()}</p>
        <p className="mt-2 text-sm">
          <Link href={versionedPackUrl} className="text-[var(--accent)] hover:underline">
            View pack
          </Link>
          {" · "}
          <a href={`${versionedApi}/syllabus`} className="text-[var(--accent)] hover:underline">Syllabus</a>
          {" · "}
          <a href={`${versionedApi}/rubric`} className="text-[var(--accent)] hover:underline">Rubric</a>
          {" · "}
          <a href={`${versionedApi}/examples`} className="text-[var(--accent)] hover:underline">Examples</a>
          {" · "}
          <a href={`${versionedApi}/install`} className="text-[var(--accent)] hover:underline">Install</a>
        </p>
        <p className="mt-4 text-[var(--ink)]">Score total: <strong>{cert.scoreTotal}</strong></p>
        {scoreByDim && Object.keys(scoreByDim).length > 0 && (
          <dl className="mt-4 space-y-1 text-sm">
            {Object.entries(scoreByDim).map(([dim, score]) => (
              <div key={dim} className="flex justify-between">
                <dt className="text-[var(--muted)]">{dim.replace(/_/g, " ")}</dt>
                <dd className="text-[var(--ink)]">{score}</dd>
              </div>
            ))}
          </dl>
        )}
        {cert.verifyHash && (
          <p className="mt-6 font-mono text-xs text-[var(--muted)] break-all">Verify hash: {cert.verifyHash}</p>
        )}
        {cert.signature && (
          <p className="mt-2 font-mono text-xs text-[var(--muted)] break-all">Signature: {cert.signature}</p>
        )}
      </div>

      <Link href="/certification" className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline">
        ← Certification
      </Link>
    </div>
  );
}
