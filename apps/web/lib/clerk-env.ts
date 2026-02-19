/**
 * Single source of truth for "is Clerk enabled and will the layout wrap with ClerkProvider?"
 * Use this in layout.tsx and in server components that render AuthCard so the client never
 * renders SignIn without ClerkProvider.
 */
export function isClerkEnabled(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  const explicitlyEnabled = process.env.NEXT_PUBLIC_CLERK_ENABLED === "true";
  return Boolean(explicitlyEnabled && key && key.startsWith("pk_"));
}
