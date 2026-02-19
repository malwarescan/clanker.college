import { NextResponse } from "next/server";
import { isClerkEnabled } from "@/lib/clerk-env";

/**
 * Dev-only: see what the server sees for Clerk env (no secrets).
 * Visit /api/debug/clerk-env to verify NEXT_PUBLIC_CLERK_* are loaded.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const enabledRaw = process.env.NEXT_PUBLIC_CLERK_ENABLED;
  return NextResponse.json({
    clerkEnabled: isClerkEnabled(),
    hasPublishableKey: Boolean(key && key.startsWith("pk_")),
    NEXT_PUBLIC_CLERK_ENABLED: enabledRaw ?? "(not set)",
    keyLength: key?.length ?? 0,
    hint: "NEXT_PUBLIC_CLERK_ENABLED must be exactly the string 'true'. Restart dev server after changing .env or .env.local.",
  });
}
