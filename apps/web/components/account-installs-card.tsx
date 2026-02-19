export function AccountInstallsCard() {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Installs</h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        After subscribing, use the Install tab on each pack page for download links.
      </p>
      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[var(--ink)]">Claude Skills</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Download the pack ZIP from the pack&apos;s Install tab</li>
            <li>Unzip into <code className="rounded bg-[var(--border)] px-1 font-mono">.claude/skills/</code> (user or project)</li>
            <li>Restart Claude Code / reload skills</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--ink)]">Claude Plugin</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Download the plugin ZIP from the pack&apos;s Install tab (if available)</li>
            <li>Install via local plugin path or repo URL</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[var(--ink)]">OpenClaw</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            <li>Add the skill path to your <code className="rounded bg-[var(--border)] px-1 font-mono">openclaw.json</code> <code className="rounded bg-[var(--border)] px-1 font-mono">skillPaths</code></li>
            <li>Use the JSON snippet shown on the pack&apos;s Install tab</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
