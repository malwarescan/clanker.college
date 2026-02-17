/**
 * SemVer comparison for pack version discipline. "Latest" = highest SemVer, not lastUpdatedAt.
 */
export function parseSemVer(v: string): [number, number, number] {
  const match = v.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return [0, 0, 0];
  return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

export function compareSemVer(a: string, b: string): number {
  const [ma, mi, pa] = parseSemVer(a);
  const [mb, mj, pb] = parseSemVer(b);
  if (ma !== mb) return ma - mb;
  if (mi !== mj) return mi - mj;
  return pa - pb;
}

/** Sort versions descending (highest first). */
export function sortVersionsDesc(versions: string[]): string[] {
  return [...versions].sort((a, b) => compareSemVer(b, a));
}
