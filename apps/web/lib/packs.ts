import { prisma } from "./db";
import { compareSemVer } from "./semver";

/** Latest = highest SemVer among versions where certified_at is not null. */
function pickLatestCertified<T extends { version: string; certifiedAt: Date | null }>(versions: T[]): T | null {
  const certified = versions.filter((v) => v.certifiedAt != null);
  if (certified.length === 0) return null;
  certified.sort((a, b) => compareSemVer(b.version, a.version));
  return certified[0] ?? null;
}

export async function getPacksWithLatestVersion() {
  const packs = await prisma.pack.findMany({
    include: {
      product: true,
      versions: {
        include: {},
      },
    },
  });
  return packs
    .map((p) => {
      const latestVersion = pickLatestCertified(p.versions);
      return { ...p, versions: p.versions, latestVersion };
    })
    .filter((p) => p.latestVersion != null);
}

export async function getPackBySlug(slug: string) {
  const pack = await prisma.pack.findUnique({
    where: { slug },
    include: {
      product: true,
      versions: {
        include: { labs: true, examples: true },
      },
    },
  });
  if (!pack) return null;
  const latestVersion = pickLatestCertified(pack.versions);
  return {
    ...pack,
    latestVersion,
  };
}

/** Availability flags for API responses. requiresPurchase = pack has a Product. */
export function getPackAvailability(
  pack: { product?: { packId: string } | null; latestVersion?: { version: string } | null },
  entitlementLocked: boolean
) {
  const hasCertifiedVersion = !!pack.latestVersion;
  const latestCertifiedSemver = pack.latestVersion?.version ?? null;
  const requiresPurchase = !!pack.product;
  const locked = requiresPurchase && entitlementLocked;
  const available = hasCertifiedVersion;
  return {
    hasCertifiedVersion,
    latestCertifiedSemver,
    requiresPurchase,
    locked,
    available,
  };
}

/** Get a specific version by pack slug and version string (e.g. "1.0.0"). */
export async function getPackVersionBySlugAndVersion(slug: string, version: string) {
  const pack = await prisma.pack.findUnique({
    where: { slug },
    include: {
      versions: {
        where: { version },
        include: { labs: true, examples: true },
      },
    },
  });
  if (!pack?.versions[0]) return null;
  return { pack, version: pack.versions[0] };
}
