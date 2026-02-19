/**
 * Lightweight event dispatch for conversion tuning.
 * Listen for "clanker_track" on window to send to GTM, Plausible, etc.
 */
export type TrackEventName =
  | "hero_primary_cta_click"
  | "hero_secondary_cta_click"
  | "hero_verify_click"
  | "scroll_depth_25"
  | "account_google_click"
  | "account_magiclink_submit"
  | "checkout_start"
  | "checkout_success"
  | "locked_pack_click"
  | "install_tab_view"
  | "install_download_click";

export function track(
  eventName: TrackEventName,
  detail?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("clanker_track", { detail: { event: eventName, ...detail } })
    );
  } catch {
    // no-op
  }
}
