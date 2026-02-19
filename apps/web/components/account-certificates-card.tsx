import Link from "next/link";

type Cert = {
  id: string;
  scoreTotal: number;
  issuedAt: Date;
  pack: { title: string; slug: string };
  packVersion: { version: string };
};

type Props = {
  certificates: Cert[];
};

export function AccountCertificatesCard({ certificates }: Props) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--paper)] p-6">
      <h2 className="text-lg font-semibold text-[var(--ink)]">Certificates</h2>
      {certificates.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--muted)]">No certificates yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 pr-4 text-left font-medium text-[var(--muted)]">Date</th>
                <th className="py-2 pr-4 text-left font-medium text-[var(--muted)]">Pack</th>
                <th className="py-2 pr-4 text-left font-medium text-[var(--muted)]">Version</th>
                <th className="py-2 pr-4 text-left font-medium text-[var(--muted)]">Score</th>
                <th className="py-2 text-left font-medium text-[var(--muted)]">Verify</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)]">
                  <td className="py-3 pr-4 text-[var(--ink)]">
                    {new Date(c.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4 text-[var(--ink)]">{c.pack.title}</td>
                  <td className="py-3 pr-4 text-[var(--ink)]">v{c.packVersion.version}</td>
                  <td className="py-3 pr-4 text-[var(--ink)]">{c.scoreTotal}/100</td>
                  <td className="py-3">
                    <Link
                      href={`/verify/${c.id}`}
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      Verify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
