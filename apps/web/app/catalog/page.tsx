import Link from "next/link";
import { getPacksWithLatestVersion } from "@/lib/packs";
import { getUserIdFromClerk, getEntitlementStatus } from "@/lib/entitlements";

export default async function CatalogPage() {
  const packs = await getPacksWithLatestVersion();
  const userId = await getUserIdFromClerk();
  const withVersion = packs.filter((p) => p.latestVersion);
  const statuses = await Promise.all(
    withVersion.map((p) => getEntitlementStatus(userId ?? null, p.id))
  );

  return (
    <div className="mx-auto max-w-site px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Catalog</h1>
      <p className="mt-2 text-[var(--muted)]">Skill Packs by school and version.</p>

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
              <p className="mt-1 text-sm text-[var(--muted)]">{pack.schoolSlug}</p>
              <ul className="mt-3 flex-1 space-y-1 text-sm text-[var(--ink)]">
                {(v.outcomesJson as string[] | null)?.slice(0, 3).map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                {locked ? (
                  <Link
                    href={`/packs/${pack.slug}`}
                    className="inline-flex rounded-md border border-[var(--accent)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--border)]/50"
                  >
                    Purchase
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/packs/${pack.slug}`}
                      className="inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                      View pack
                    </Link>
                    <Link
                      href={`/packs/${pack.slug}#panel-install`}
                      className="inline-flex rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]/50"
                    >
                      Install
                    </Link>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
