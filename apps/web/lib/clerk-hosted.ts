/**
 * Clerk Hosted Pages (accounts.clanker.college).
 * When NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL is set, "Sign in" sends users there
 * and they return to clanker.college/account (or redirect_url).
 */

const PORTAL_BASE = process.env.NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL?.trim() || "";
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL?.trim()
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
  : "https://clanker.college";

/** Whether we use Clerk Hosted Pages for auth (accounts.clanker.college). */
export function useHostedAccountPortal(): boolean {
  return PORTAL_BASE.length > 0;
}

/** Base URL of the account portal, e.g. https://accounts.clanker.college */
export function getAccountPortalBaseUrl(): string {
  return PORTAL_BASE;
}

/**
 * Full sign-in URL for the hosted portal.
 * @param redirectPath - Path (or path + hash) to return to after sign-in, e.g. /account or /packs/foo#panel-install
 */
export function getHostedSignInUrl(redirectPath: string = "/account"): string {
  if (!PORTAL_BASE) return `/account${redirectPath !== "/account" ? `?returnTo=${encodeURIComponent(redirectPath)}` : ""}`;
  const redirectUrl = redirectPath.startsWith("http") ? redirectPath : `${APP_ORIGIN}${redirectPath.startsWith("/") ? "" : "/"}${redirectPath}`;
  return `${PORTAL_BASE.replace(/\/$/, "")}/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;
}

/** App origin for redirect_url (server-side). */
export function getAppOrigin(): string {
  return APP_ORIGIN;
}
