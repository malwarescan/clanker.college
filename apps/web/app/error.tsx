"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-read px-4 py-16 sm:px-6">
      <h1 className="text-xl font-semibold text-[var(--ink)]">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {process.env.NODE_ENV === "development" ? error.message : "An error occurred loading this page."}
      </p>
      {process.env.NODE_ENV === "development" && error.digest && (
        <p className="mt-1 font-mono text-xs text-[var(--muted)]">Digest: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
