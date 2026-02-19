import Link from "next/link";
import { getPacksWithLatestVersion } from "@/lib/packs";
import { getUserIdFromClerk, getEntitlementStatus } from "@/lib/entitlements";
import { BottomActionBar } from "@/components/bottom-action-bar";
import { CatalogFiltersSheet } from "@/components/catalog-filters-sheet";

export default async function CatalogPage() {
  const packs = await getPacksWithLatestVersion();
  const userId = await getUserIdFromClerk();
  const withVersion = packs.filter((p) => p.latestVersion);
  const statuses = await Promise.all(
    withVersion.map((p) => getEntitlementStatus(userId ?? null, p.id))
  );

  return (
    <div className="mx-auto max-w-site px-[var(--mobile-padding)] py-10 pb-24 sm:px-6 md:pb-10">
      <BottomActionBar variant="catalog" signedIn={!!userId} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--ink)]">Catalog</h1>
          <p className="mt-2 text-[var(--muted)]">Skill Packs by school and version.</p>
        </div>
        <CatalogFiltersSheet />
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {withVersion.map((pack, i) => {
          const status = statuses[i]!;
          const requiresPurchase = !!pack.product;
          const locked = requiresPurchase && status.locked;
          const v = pack.latestVersion!;
          return (
            <article
              key={pack.id}
              className="flex flex-col rounded-lg border border-[var(--border)] p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-[var(--ink)]">{pack.title}</h2>
                <span className="rounded bg-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--ink)]">
                  Certified v{v.version}
                </span>
                {locked && (
                  <span className="rounded border border-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted)]">
                    Locked
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">{(v.outcomesJson as string[] | null)?.[0] ?? pack.schoolSlug}</p>
              <div className="mt-4 flex gap-2">
                {locked ? (
                  <Link
                    href={`/packs/${pack.slug}#panel-install`}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md border border-[var(--accent)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--border)]/50 sm:flex-initial"
                  >
                    Upgrade
                  </Link>
                ) : (
                  <Link
                    href={`/packs/${pack.slug}`}
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 sm:flex-initial"
                  >
                    View
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
