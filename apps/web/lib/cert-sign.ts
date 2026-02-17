import { createHash, createPrivateKey, createPublicKey, sign, verify } from "crypto";

export interface CanonicalCertPayload {
  cert_id: string;
  org_id: string | null;
  agent_id: string | null;
  pack_id: string;
  pack_version_id: string;
  issued_at: string;
  score_total: number;
  score_by_dimension: Record<string, number>;
  hard_fails: { dimension_id: string; code: string; message: string }[];
}

function sortedKeys(obj: Record<string, unknown>): string[] {
  return Object.keys(obj).sort();
}

export function buildCanonicalPayload(p: CanonicalCertPayload): string {
  const scoreByDim = sortedKeys(p.score_by_dimension as Record<string, unknown>).reduce(
    (acc, k) => ({ ...acc, [k]: (p.score_by_dimension as Record<string, number>)[k] }),
    {} as Record<string, number>
  );
  const hardFails = [...(p.hard_fails ?? [])].sort((a, b) =>
    a.dimension_id.localeCompare(b.dimension_id)
  );
  return JSON.stringify({
    cert_id: p.cert_id,
    org_id: p.org_id,
    agent_id: p.agent_id,
    pack_id: p.pack_id,
    pack_version_id: p.pack_version_id,
    issued_at: p.issued_at,
    score_total: p.score_total,
    score_by_dimension: scoreByDim,
    hard_fails: hardFails,
  });
}

export function hashPayload(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

/** Sign payload with Ed25519. In production, CERT_PRIVATE_KEY is required; in dev, hash fallback is allowed. */
export function signPayload(payload: string): { signature: string; verifyHash: string } {
  const verifyHash = hashPayload(payload);
  const pem = process.env.CERT_PRIVATE_KEY;
  if (pem) {
    try {
      const privateKey = createPrivateKey(pem);
      const sig = sign(null, Buffer.from(payload, "utf8"), privateKey);
      return { signature: sig.toString("base64"), verifyHash };
    } catch {
      if (process.env.NODE_ENV === "production") throw new Error("Ed25519 signing failed");
      const fallback = createHash("sha256")
        .update(verifyHash + (process.env.CERT_SECRET ?? "clanker"))
        .digest("hex");
      return { signature: fallback, verifyHash };
    }
  }
  if (process.env.NODE_ENV === "production") throw new Error("Signing not configured.");
  const fallback = createHash("sha256")
    .update(verifyHash + (process.env.CERT_SECRET ?? "clanker"))
    .digest("hex");
  return { signature: fallback, verifyHash };
}

export function getPublicKeyPem(): string | null {
  const pem = process.env.CERT_PRIVATE_KEY;
  if (!pem) return null;
  try {
    const pub = createPublicKey(pem);
    return pub.export({ type: "spki", format: "pem" }) as string;
  } catch {
    return null;
  }
}

export function verifySignature(payload: string, signatureBase64: string, publicKeyPem: string): boolean {
  try {
    const key = createPublicKey(publicKeyPem);
    const sig = Buffer.from(signatureBase64, "base64");
    return verify(null, Buffer.from(payload, "utf8"), key, sig);
  } catch {
    return false;
  }
}
