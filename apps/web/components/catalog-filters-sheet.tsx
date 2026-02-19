"use client";

import { useState } from "react";

/**
 * Mobile-first: "Filter" opens a bottom sheet. Sticky Apply at bottom.
 * Default filters: Certified only (default on). Extend with Difficulty, Category later.
 */
export function CatalogFiltersSheet() {
  const [open, setOpen] = useState(false);
  const [certifiedOnly, setCertifiedOnly] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-[var(--border)] bg-[var(--paper)] px-4 py-2 text-sm font-medium text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        Filter
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Filters"
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-auto rounded-t-xl border-t border-[var(--border)] bg-[var(--paper)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--ink)]">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-[44px] min-w-[44px] text-[var(--muted)] hover:text-[var(--ink)]"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={certifiedOnly}
                onChange={(e) => setCertifiedOnly(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              <span className="text-sm text-[var(--ink)]">Certified only</span>
            </label>
            <div className="mt-6 border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-[44px] w-full items-center justify-center rounded-md bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
