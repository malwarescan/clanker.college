/**
 * Certified stamp: crest + "CERTIFIED" + version. Use on certificates and pack badges.
 */
import { Crest } from "./crest";

export function CertifiedStamp({ version }: { version: string }) {
  return (
    <div
      className="inline-flex flex-col items-center gap-1 rounded border-2 border-[var(--accent)] px-3 py-2"
      style={{ borderColor: "var(--accent)" }}
    >
      <Crest className="h-6 w-6 text-[var(--accent)]" />
      <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
        Certified
      </span>
      <span className="text-xs font-mono text-[var(--muted)]">v{version}</span>
    </div>
  );
}
