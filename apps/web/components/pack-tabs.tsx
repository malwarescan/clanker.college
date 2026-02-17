"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const TABS = [
  { id: "syllabus", label: "Syllabus" },
  { id: "labs", label: "Labs" },
  { id: "rubric", label: "Rubric" },
  { id: "examples", label: "Examples" },
  { id: "install", label: "Install" },
  { id: "changelog", label: "Changelog" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export type InstallState = "signed_out" | "locked" | "entitled";

export function PackTabs({
  syllabusMd,
  labs,
  rubricJson,
  examplesNdjson,
  installMd,
  version,
  packSlug,
  installState,
  stripePriceId,
}: {
  syllabusMd: string | null;
  labs: { labSlug: string; title: string; promptMd: string | null; passThreshold: number }[];
  rubricJson: unknown;
  examplesNdjson: string | null;
  installMd: string | null;
  version: string;
  packSlug: string;
  installState: InstallState;
  stripePriceId?: string | null;
}) {
  const [tab, setTab] = useState<TabId>("syllabus");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#panel-install") setTab("install");
    const onHashChange = () => {
      if (window.location.hash === "#panel-install") setTab("install");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="mt-10">
      <div className="border-b border-[var(--border)]" role="tablist" aria-label="Pack sections">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              className="whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              style={{
                borderColor: tab === id ? "var(--accent)" : "transparent",
                color: tab === id ? "var(--accent)" : "var(--muted)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[200px] py-6">
        {tab === "syllabus" && (
          <div id="panel-syllabus" role="tabpanel" aria-labelledby="tab-syllabus" className="prose prose-sm max-w-read text-[var(--ink)]">
            <pre className="whitespace-pre-wrap font-sans text-sm">{syllabusMd || "No syllabus."}</pre>
          </div>
        )}
        {tab === "labs" && (
          <div id="panel-labs" role="tabpanel" aria-labelledby="tab-labs">
            <p className="text-sm text-[var(--muted)]">Submit output to <code className="rounded bg-[var(--border)] px-1 font-mono">POST /api/grade</code></p>
            <ul className="mt-4 space-y-6">
              {labs.map((lab) => (
                <li key={lab.labSlug} className="rounded-lg border border-[var(--border)] p-4">
                  <h4 className="font-medium text-[var(--ink)]">{lab.title}</h4>
                  <p className="mt-1 text-xs text-[var(--muted)]">Pass threshold: {lab.passThreshold}</p>
                  {lab.promptMd && <pre className="mt-2 whitespace-pre-wrap text-sm text-[var(--ink)]">{lab.promptMd}</pre>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === "rubric" && (
          <div id="panel-rubric" role="tabpanel" aria-labelledby="tab-rubric">
            <RubricTable rubric={rubricJson} />
          </div>
        )}
        {tab === "examples" && (
          <div id="panel-examples" role="tabpanel" aria-labelledby="tab-examples">
            <ExamplesBlock ndjson={examplesNdjson} />
          </div>
        )}
        {tab === "install" && (
          <div id="panel-install" role="tabpanel" aria-labelledby="tab-install">
            <InstallPanel
              packSlug={packSlug}
              installState={installState}
              stripePriceId={stripePriceId}
              installMd={installMd}
            />
          </div>
        )}
        {tab === "changelog" && (
          <div id="panel-changelog" role="tabpanel" aria-labelledby="tab-changelog">
            <p className="text-sm text-[var(--muted)]">Changelog for v{version}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-[var(--ink)]">
              <li>v{version} — Initial certified release.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function RubricTable({ rubric }: { rubric: unknown }) {
  const r = rubric as {
    pass_score?: number;
    dimensions?: { id: string; points: number; hard_fails: string[]; score_guide: { min: number; max: number; criteria: string }[] }[];
  } | null;
  if (!r?.dimensions?.length) {
    return <p className="text-sm text-[var(--muted)]">No rubric data.</p>;
  }

  return (
    <>
      {/* Desktop: table */}
      <div className="rubric-table-wrapper hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[480px] border-collapse text-sm" role="table" aria-label="Rubric dimensions">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-3 pr-4 text-left font-semibold text-[var(--ink)]">Dimension</th>
              <th className="py-3 pr-4 text-left font-semibold text-[var(--ink)]">Points</th>
              <th className="py-3 pr-4 text-left font-semibold text-[var(--ink)]">Score guide</th>
              <th className="py-3 text-left font-semibold text-[var(--ink)]">Hard-Fails</th>
            </tr>
          </thead>
          <tbody>
            {r.dimensions.map((d) => (
              <tr key={d.id} className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium text-[var(--ink)]">{d.id.replace(/_/g, " ")}</td>
                <td className="py-3 pr-4 text-[var(--ink)]">{d.points}</td>
                <td className="py-3 pr-4 text-[var(--muted)]">
                  <ul className="list-disc pl-4">
                    {d.score_guide?.map((sg, i) => (
                      <li key={i}>{sg.min}–{sg.max}: {sg.criteria}</li>
                    ))}
                  </ul>
                </td>
                <td className="py-3 text-[var(--ink)]">
                  <ul className="list-disc pl-4">
                    {d.hard_fails?.map((hf, i) => (
                      <li key={i}>{hf}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile: stacked cards */}
      <div className="space-y-4 sm:hidden" role="list" aria-label="Rubric dimensions">
        {r.dimensions.map((d) => (
          <article key={d.id} className="rounded-lg border border-[var(--border)] p-4">
            <h4 className="font-medium text-[var(--ink)]">{d.id.replace(/_/g, " ")}</h4>
            <p className="mt-1 text-sm text-[var(--muted)]">{d.points} pts</p>
            <ul className="mt-3 list-disc pl-4 text-sm text-[var(--muted)]" aria-label="Score guide">
              {(d.score_guide ?? []).slice(0, 4).map((sg, i) => (
                <li key={i}>{sg.min}–{sg.max}: {sg.criteria}</li>
              ))}
            </ul>
            {(d.hard_fails?.length ?? 0) > 0 && (
              <p className="mt-3 text-sm font-medium text-[var(--ink)]">Hard-fails:</p>
            )}
            <ul className="list-disc pl-4 text-sm text-[var(--ink)]">
              {d.hard_fails?.map((hf, i) => (
                <li key={i}>{hf}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">Pass: score ≥ {r.pass_score ?? 85} and zero hard-fails.</p>
    </>
  );
}

function ExamplesBlock({ ndjson }: { ndjson: string | null }) {
  if (!ndjson?.trim()) return <p className="text-sm text-[var(--muted)]">No examples.</p>;
  const lines = ndjson.trim().split("\n").filter(Boolean);

  return (
    <ul className="space-y-4">
      {lines.map((line, i) => {
        try {
          const obj = JSON.parse(line) as Record<string, unknown>;
          return (
            <li key={i} className="rounded-lg border border-[var(--border)] p-4">
              <CopyButton text={line} />
              <pre className="mt-2 overflow-x-auto text-xs text-[var(--ink)]">{JSON.stringify(obj, null, 2)}</pre>
            </li>
          );
        } catch {
          return (
            <li key={i} className="rounded-lg border border-[var(--border)] p-4">
              <pre className="text-xs text-[var(--ink)]">{line}</pre>
            </li>
          );
        }
      })}
    </ul>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded border border-[var(--border)] bg-[var(--paper)] px-2 py-1 text-xs font-medium text-[var(--ink)] hover:bg-[var(--border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

type InstallPayload = {
  zipUrl: string | null;
  pluginZipUrl: string | null;
  openclawConfigSnippet: unknown;
  installInstructions: { claude_skills: string[]; claude_plugin: string[]; openclaw: string[] };
};

function InstallPanel({
  packSlug,
  installState,
  stripePriceId,
  installMd,
}: {
  packSlug: string;
  installState: InstallState;
  stripePriceId?: string | null;
  installMd: string | null;
}) {
  const [payload, setPayload] = useState<InstallPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasePending, setPurchasePending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    if (installState !== "entitled") return;
    setLoading(true);
    fetch(`/api/packs/${packSlug}/install`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setPayload(data);
      })
      .finally(() => setLoading(false));
  }, [installState, packSlug]);

  if (installState === "signed_out") {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
        <p className="text-[var(--ink)]">Sign in to install this pack.</p>
        <Link
          href="/account"
          className="mt-4 inline-block rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (installState === "locked") {
    const runCheckout = () => {
      setCheckoutError(null);
      setPurchasePending(true);
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packSlug }),
      })
        .then((r) => r.json().then((data) => ({ status: r.status, data })))
        .then(({ status, data }: { status: number; data: { url?: string; error?: string } }) => {
          if (data?.url) {
            window.location.href = data.url;
            return;
          }
          setPurchasePending(false);
          if (status === 401) setCheckoutError("Sign in required. Sign in above or go to Account, then try Purchase again.");
          else if (status === 404) setCheckoutError("This pack is not set up for purchase. Contact support.");
          else setCheckoutError(data?.error ?? "Checkout failed. Try again or contact support.");
        })
        .catch(() => {
          setPurchasePending(false);
          setCheckoutError("Network error. Check your connection and try again.");
        });
    };
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
        <p className="text-[var(--ink)]">Purchase this pack to access install artifacts.</p>
        <button
          type="button"
          onClick={runCheckout}
          disabled={purchasePending}
          className="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-70"
        >
          {purchasePending ? "Redirecting…" : "Purchase"}
        </button>
        {checkoutError && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {checkoutError}
          </p>
        )}
      </div>
    );
  }

  if (loading || !payload) {
    return <p className="text-sm text-[var(--muted)]">Loading install options…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] p-4">
        <h4 className="font-medium text-[var(--ink)]">Claude Skills (ZIP)</h4>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--ink)]">
          {payload.installInstructions.claude_skills.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        {payload.zipUrl && (
          <a
            href={payload.zipUrl}
            className="mt-3 inline-block rounded border border-[var(--border)] bg-[var(--paper)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]"
          >
            Download ZIP
          </a>
        )}
        {!payload.zipUrl && <p className="mt-2 text-xs text-[var(--muted)]">ZIP not yet published.</p>}
      </div>
      {payload.pluginZipUrl && (
        <div className="rounded-lg border border-[var(--border)] p-4">
          <h4 className="font-medium text-[var(--ink)]">Claude Plugin</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--ink)]">
            {payload.installInstructions.claude_plugin.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <a
            href={payload.pluginZipUrl}
            className="mt-3 inline-block rounded border border-[var(--border)] bg-[var(--paper)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--border)]"
          >
            Download plugin ZIP
          </a>
        </div>
      )}
      <div className="rounded-lg border border-[var(--border)] p-4">
        <h4 className="font-medium text-[var(--ink)]">OpenClaw</h4>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--ink)]">
          {payload.installInstructions.openclaw.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <CopyButton text={JSON.stringify(payload.openclawConfigSnippet, null, 2)} />
      </div>
      {installMd && (
        <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--muted)]">{installMd}</pre>
      )}
    </div>
  );
}
