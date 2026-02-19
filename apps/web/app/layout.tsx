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

  const domain = process.env.NEXT_PUBLIC_CLERK_DOMAIN?.trim() || undefined;
  const isSatellite = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true";

  return (
    <ClerkErrorBoundary fallback={body}>
      {/* Clerk Next.js types require routerPush/routerReplace when custom props are used; App Router provides them at runtime. */}
      <ClerkProvider {...({ domain, isSatellite } as Record<string, unknown>)}>
        {body}
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}
