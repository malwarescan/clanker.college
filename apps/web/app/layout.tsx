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
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Clanker.College — Skill Packs for Agents",
  description: "Versioned, deterministic training modules. Syllabus, Labs, Rubric, Certification.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
