/** Base URL for absolute links in API responses. Agents and SDKs need stable absolute URLs. */
export function getBaseUrl(): string {
  return process.env.PUBLIC_BASE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://clanker.college";
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
