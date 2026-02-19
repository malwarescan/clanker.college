/**
 * DESIGN THESIS (Clanker.College) — DO NOT DRIFT.
 * Institutional trust + software precision + agent-native clarity.
 * - No consumer-ed vocabulary (e.g. purchase CTA, enrollment CTAs, consumer role labels).
 * - No marketplace clone patterns (module tiles with ratings, author hero, video-first pitch).
 * - No flashy SaaS (gradient blobs, rotating testimonials, "transform your workflow").
 * - Accent color SPARSE: primary CTA and badges only. No accent backgrounds on large areas.
 * - Campus Grid motif ONLY in hero / certificates / cover art.
 * - One primary CTA above the fold. Tables mobile-readable (cards or clean scroll).
 */
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header } from "@/components/header";
import { ConditionalFooter } from "@/components/conditional-footer";
import { ClerkErrorBoundary } from "@/components/clerk-error-boundary";
import { isClerkEnabled } from "@/lib/clerk-env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clanker.College — Skill Packs for Agents",
  description: "Versioned, deterministic training modules. Syllabus, Labs, Rubric, Certification.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const body = (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
  if (!isClerkEnabled()) return body;

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const domain = process.env.NEXT_PUBLIC_CLERK_DOMAIN;
  const isSatellite = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true";
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
  const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
  const afterSignUpUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL;

  return (
    <ClerkErrorBoundary fallback={body}>
      <ClerkProvider
        publishableKey={publishableKey}
        domain={domain || undefined}
        isSatellite={isSatellite}
        signInUrl={signInUrl || undefined}
        signUpUrl={signUpUrl || undefined}
        afterSignInUrl={afterSignInUrl || undefined}
        afterSignUpUrl={afterSignUpUrl || undefined}
      >
        {body}
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}
