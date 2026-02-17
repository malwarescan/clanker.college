/**
 * Lightweight event dispatch for hero and scroll instrumentation.
 * Listen for "clanker_track" on window to send to GTM, Plausible, etc.
 */
export type HeroEventName =
  | "hero_primary_cta_click"
  | "hero_secondary_cta_click"
  | "hero_verify_click"
  | "scroll_depth_25";

export function track(eventName: HeroEventName): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("clanker_track", { detail: { event: eventName } })
    );
    // Optional: gtag, plausible, etc. can be wired here
    // if (typeof window.gtag === "function") window.gtag("event", eventName);
  } catch {
    // no-op
  }
}
