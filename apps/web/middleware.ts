import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

/**
 * Clerk integration: clerkMiddleware() per quickstart.
 * Next.js requires this file to be named middleware.ts (not proxy.ts).
 * Same condition as layout: only run Clerk when explicitly enabled with a pk_ key.
 */
const clerkEnabled =
  process.env.NEXT_PUBLIC_CLERK_ENABLED === "true" &&
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? "").startsWith("pk_");

const authorizedParties = [
  "https://clanker.college",
  "https://accounts.clanker.college",
  "http://localhost:3000",
  // Add "https://www.clanker.college" if you use www.
];

/** Redirect to Clerk Hosted sign-in when using account portal; otherwise use default protect. */
const ACCOUNT_PORTAL_BASE = process.env.NEXT_PUBLIC_CLERK_ACCOUNT_PORTAL_URL?.trim() || "";
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_URL?.trim()
  ? new URL(process.env.NEXT_PUBLIC_APP_URL).origin
  : "https://clanker.college";

function getHostedSignInRedirect(req: NextRequest): string {
  if (!ACCOUNT_PORTAL_BASE) return "";
  const redirectUrl = req.nextUrl.origin + req.nextUrl.pathname + req.nextUrl.search;
  return `${ACCOUNT_PORTAL_BASE.replace(/\/$/, "")}/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!clerkEnabled) return NextResponse.next();
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  // Marketing and public routes; /account is protected when using hosted portal.
  const isPublicRoute = createRouteMatcher([
    "/",
    "/auth(.*)",
    "/api(.*)",
    "/catalog(.*)",
    "/docs(.*)",
    "/packs(.*)",
    "/schools(.*)",
    "/certification(.*)",
    "/verify(.*)",
    // When using hosted portal, /account is protected below. When not, allow /account for in-app SignIn.
    ...(ACCOUNT_PORTAL_BASE ? [] : ["/account(.*)"]),
  ]);
  const isAccountRoute = createRouteMatcher(["/account(.*)"]);

  return clerkMiddleware(
    async (auth, req) => {
      if (isPublicRoute(req)) return;
      // Protect /account when using hosted portal: redirect to accounts.clanker.college/sign-in
      if (ACCOUNT_PORTAL_BASE && isAccountRoute(req)) {
        const hostedSignInUrl = getHostedSignInRedirect(req);
        await auth.protect({ unauthenticatedUrl: hostedSignInUrl });
        return;
      }
      await auth.protect();
    },
    { authorizedParties }
  )(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
