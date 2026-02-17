import Link from "next/link";
import { getPacksWithLatestVersion } from "@/lib/packs";
import { prisma } from "@/lib/db";
import { HeroActions } from "@/components/hero-actions";
import { HeroScrollDepth } from "@/components/hero-scroll-depth";
import { HeroVerifyLink } from "@/components/hero-verify-link";

const FEATURED_SLUG = "design-systems";

async function getExampleCertificate() {
  const cert = await prisma.certificate.findFirst({
    orderBy: { issuedAt: "desc" },
    include: { pack: true, packVersion: true },
  });
  if (!cert) return null;
  const passThreshold = 85;
  return {
    certId: cert.id,
    packTitle: cert.pack.title,
    version: cert.packVersion.version,
    scoreTotal: cert.scoreTotal,
    passed: cert.scoreTotal >= passThreshold,
  };
}

export default async function HomePage() {
  const [packs, exampleCert] = await Promise.all([
    getPacksWithLatestVersion(),
    getExampleCertificate(),
  ]);
  const featured = packs.slice(0, 6);
  const firstPackSlug = featured[0]?.slug ?? FEATURED_SLUG;
  const verifyHref = exampleCert ? `/verify/${exampleCert.certId}` : "/certification#certificate-preview";

  return (
    <div>
      <HeroScrollDepth />
      {/* Hero — minimal: H1, one line, two CTAs, optional one-line proof */}
      <section className="border-b border-[var(--border)] bg-[var(--paper)]">
        <div className="mx-auto max-w-site px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-[60ch]">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              Skill packs for agents. Versioned. Deterministic.
            </h1>
            <p className="mt-2 text-[var(--ink)]/90 sm:text-lg">
              Labs + rubrics that prevent drift. Verifiable certificates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <HeroActions />
            </div>
            <p className="mt-4 text-sm text-[var(--muted)]">
              <HeroVerifyLink href={verifyHref} />
              {exampleCert != null ? ` — ${exampleCert.scoreTotal}/100 Pass` : " — 92/100 Pass"}
            </p>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps + technical accordion (moved content from hero) */}
      <section className="mx-auto max-w-site border-b border-[var(--border)] px-4 py-12 sm:px-6">
        <h2 className="text-xl font-semibold text-[var(--ink)]">How it works</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Pick a pack → run labs → get certified.
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          For agent teams and training programs that need auditable, repeatable competency. Each pack includes a syllabus, graded labs, a deterministic rubric, and a certificate you can verify by hash.
        </p>
        <ol className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-8">
          {[
            { step: 1, label: "Choose a pack", href: "/catalog", desc: "Catalog" },
            { step: 2, label: "Run labs", href: `/packs/${firstPackSlug}`, desc: "Featured pack" },
            { step: 3, label: "Verify certification", href: verifyHref, desc: "Verify page" },
          ].map(({ step, label, href, desc }) => (
            <li key={step} className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--paper)] text-sm font-medium text-[var(--ink)]" aria-hidden>
                {step}
              </span>
              <div>
                <Link href={href} className="font-medium text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                  {label}
                </Link>
                <p className="text-sm text-[var(--muted)]">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <details className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--paper)] p-4">
          <summary className="cursor-pointer font-medium text-[var(--ink)]">Technical details</summary>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>Deterministic grading — no reviewer drift</li>
            <li>Version pinning — regression-safe production</li>
            <li>Public verification — certificate hash + verify endpoint</li>
          </ul>
        </details>
      </section>

      {/* Who it's for / Use cases */}
      <section className="mx-auto max-w-site px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Teams building agents</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Evaluation, regression prevention, version pinning.
            </p>
            <Link href="/catalog" className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
              See packs →
            </Link>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Schools / training programs</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Standardized grading, audit trails, cohorts.
            </p>
            <Link href="/schools" className="mt-4 inline-block text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
              See schools →
            </Link>
          </div>
        </div>
      </section>

      {/* What you get — outcome-first labels + View example */}
      <section className="border-t border-[var(--border)] bg-[var(--paper)]">
        <div className="mx-auto max-w-site px-4 py-16 sm:px-6">
          <h2 className="text-xl font-semibold text-[var(--ink)]">What you get</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Scope and constraints", subtitle: "What the agent must and must not do", href: `/packs/${FEATURED_SLUG}` },
              { title: "Prove competence", subtitle: "Submit outputs, graded automatically", href: `/packs/${FEATURED_SLUG}` },
              { title: "Deterministic grading", subtitle: "No subjective review drift", href: `/api/packs/${FEATURED_SLUG}/rubric` },
              { title: "Verifiable proof", subtitle: "Hash + public verify endpoint", href: "/certification#certificate-preview" },
            ].map((item) => (
              <li key={item.title} className="rounded-lg border border-[var(--border)] p-4">
                <h3 className="font-medium text-[var(--ink)]">{item.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.subtitle}</p>
                <Link href={item.href} className="mt-3 inline-block text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
                  View an example →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured packs — cards with certified tag; empty state if none */}
      <section className="mx-auto max-w-site px-4 py-16 sm:px-6">
        <h2 className="text-xl font-semibold text-[var(--ink)]">Featured packs</h2>
        {featured.length > 0 ? (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((pack) => (
                <article
                  key={pack.id}
                  className="flex flex-col rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6"
                >
                  <h3 className="font-semibold text-[var(--ink)]">{pack.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ink)] line-clamp-1">
                    {(pack.latestVersion?.outcomesJson as string[] | null)?.[0] ?? pack.summary ?? "—"}
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    v{pack.latestVersion?.version} certified
                  </p>
                  <Link
                    href={`/packs/${pack.slug}`}
                    className="mt-4 inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                  >
                    View pack
                  </Link>
                </article>
              ))}
            </div>
            <Link href="/catalog" className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline">
              View catalog →
            </Link>
          </>
        ) : (
          <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--paper)] p-8 text-center">
            <p className="text-[var(--muted)]">No packs published yet.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Link href="/docs" className="text-sm font-medium text-[var(--accent)] hover:underline">
                Docs
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Single spec line — no repeated proof strip */}
      <section className="border-t border-[var(--border)] bg-[var(--paper)]">
        <div className="mx-auto max-w-site px-4 py-6 sm:px-6">
          <p className="text-center text-sm text-[var(--muted)]">
            Pass ≥ 85 · Zero hard-fails · Deterministic rubric · Versioned packs · Hash-verified certificates
          </p>
        </div>
      </section>
    </div>
  );
}
