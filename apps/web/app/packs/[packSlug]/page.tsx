/**
 * PACK PAGE TEMPLATE — Must pass RUBRIC_FOR_THE_RUBRICS.
 * Above fold: pack name, vX.Y, last updated, outcomes, ONE primary CTA, one secondary CTA.
 * Tabs required: Syllabus, Labs, Rubric, Examples, Install, Changelog.
 * Install tab: signed_out → sign in; locked → purchase; entitled → install cards.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPackBySlug } from "@/lib/packs";
import { getUserIdFromClerk, getEntitlementStatus } from "@/lib/entitlements";
import { PackTabs } from "@/components/pack-tabs";
import { BottomActionBar } from "@/components/bottom-action-bar";

export default async function PackPage({ params }: { params: Promise<{ packSlug: string }> }) {
  const { packSlug } = await params;
  const pack = await getPackBySlug(packSlug);
  if (!pack?.latestVersion) notFound();

  const userId = await getUserIdFromClerk();
  const status = await getEntitlementStatus(userId ?? null, pack.id);
  const requiresPurchase = !!pack.product;
  const installState =
    !userId ? "signed_out" : requiresPurchase && status.locked ? "locked" : "entitled";
  const stripePriceId = pack.product ? (pack.product as { stripePriceId?: string }).stripePriceId : null;

  const v = pack.latestVersion;
  const outcomes = (v.outcomesJson as string[] | null) ?? [];
  const examplesRow = v.examples?.[0];

  return (
    <div className="mx-auto max-w-site px-4 py-10 pb-24 sm:px-6 md:pb-10">
      <BottomActionBar
        variant="pack"
        signedIn={!!userId}
        installState={installState}
        packSlug={pack.slug}
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* Above fold: title, version, last updated, outcomes, primary CTA, secondary CTA */}
          <h1 className="text-2xl font-semibold text-[var(--ink)] sm:text-3xl">{pack.title}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            v{v.version} · Last updated {new Date(v.lastUpdatedAt).toLocaleDateString()}
          </p>
          <ul className="mt-4 list-disc pl-5 text-[var(--ink)]">
            {outcomes.slice(0, 5).map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={`/packs/${pack.slug}#panel-install`}
              className="inline-flex items-center justify-center rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Start Pack
            </Link>
            <a
              href="#panel-rubric"
              className="inline-flex items-center justify-center rounded-md border border-[var(--border)] bg-[var(--paper)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              View Rubric
            </a>
          </div>

          <PackTabs
            syllabusMd={v.syllabusMd}
            labs={v.labs}
            rubricJson={v.rubricJson}
            examplesNdjson={examplesRow?.examplesNdjson ?? null}
            installMd={v.installMd}
            version={v.version}
            packSlug={pack.slug}
            installState={installState}
            stripePriceId={stripePriceId}
          />
        </div>

        {/* Right rail */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
            <h3 className="text-sm font-semibold text-[var(--ink)]">Pack details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Difficulty</dt>
                <dd className="text-[var(--ink)]">Intermediate</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Time to certify</dt>
                <dd className="text-[var(--ink)]">~2–4 hours</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Pass threshold</dt>
                <dd className="text-[var(--ink)]">85</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Install target</dt>
                <dd className="font-mono text-xs text-[var(--ink)]">/api/packs/{pack.slug}/latest</dd>
              </div>
            </dl>
            <Link
              href={`/packs/${pack.slug}`}
              className="mt-6 block w-full rounded-md bg-[var(--accent)] px-4 py-2 text-center text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              Start Pack
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
