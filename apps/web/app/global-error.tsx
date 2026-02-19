"use client";

/**
 * Catches root-level errors (e.g. layout or ClerkProvider). Replaces root layout when triggered.
 * Must include <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ padding: "2rem", maxWidth: "40rem", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#666" }}>
            {process.env.NODE_ENV === "development" ? error.message : "An error occurred loading the app."}
          </p>
          {process.env.NODE_ENV === "development" && error.digest && (
            <p style={{ marginTop: "0.25rem", fontFamily: "monospace", fontSize: "0.75rem", color: "#666" }}>
              Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: "1.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
