"use client";

import { useState } from "react";

export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative mt-4">
      <pre className="overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--border)]/30 p-4 text-sm font-mono text-[var(--ink)]">
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute right-2 top-2 rounded border border-[var(--border)] bg-[var(--paper)] px-2 py-1 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
