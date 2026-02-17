import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildCanonicalPayload, hashPayload, getPublicKeyPem, verifySignature } from "@/lib/cert-sign";
import { NO_STORE_HEADERS } from "@/lib/no-store-headers";
import { absoluteUrl } from "@/lib/base-url";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ certId: string }> }
) {
  const { certId } = await params;
  const cert = await prisma.certificate.findUnique({
    where: { id: certId },
    include: { pack: true, packVersion: true },
  });
  if (!cert) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404, headers: NO_STORE_HEADERS });
  }

  const scoreByDim = cert.scoreByDimensionJson as Record<string, number>;
  const hardFailsStored = cert.hardFailsJson;
  const hardFails = Array.isArray(hardFailsStored)
    ? (hardFailsStored as { dimension_id: string; code: string; message: string }[])
    : [];
  const payload = buildCanonicalPayload({
    cert_id: cert.id,
    org_id: cert.orgId,
    agent_id: cert.agentId,
    pack_id: cert.packId,
    pack_version_id: cert.packVersionId,
    issued_at: cert.issuedAt.toISOString(),
    score_total: cert.scoreTotal,
    score_by_dimension: scoreByDim ?? {},
    hard_fails: hardFails,
  });
  const expectedHash = hashPayload(payload);
  const hash_valid = cert.verifyHash === expectedHash;

  let signature_valid: boolean | null = null;
  const publicKeyPem = getPublicKeyPem();
  if (publicKeyPem && cert.signature) {
    try {
      signature_valid = verifySignature(payload, cert.signature, publicKeyPem);
    } catch {
      signature_valid = false;
    }
  }

  const verification_status =
    signature_valid === true
      ? "verified"
      : hash_valid
        ? "hash_verified"
        : "invalid";

  const slug = cert.pack.slug;
  const semver = cert.packVersion.version;
  const versioned_urls = {
    pack: absoluteUrl(`/packs/${slug}`),
    syllabus: absoluteUrl(`/api/packs/${slug}/v/${semver}/syllabus`),
    rubric: absoluteUrl(`/api/packs/${slug}/v/${semver}/rubric`),
    examples: absoluteUrl(`/api/packs/${slug}/v/${semver}/examples`),
    install: absoluteUrl(`/api/packs/${slug}/v/${semver}/install`),
  };

  return NextResponse.json(
    {
      cert_id: cert.id,
      pack_title: cert.pack.title,
      pack_version: semver,
      pack_version_id: cert.packVersionId,
      semver,
      score_total: cert.scoreTotal,
      score_by_dimension: scoreByDim,
      issued_at: cert.issuedAt,
      verify_hash: cert.verifyHash,
      signature: cert.signature ? cert.signature : undefined,
      verification_status,
      hash_valid,
      signature_valid: signature_valid ?? undefined,
      versioned_urls,
    },
    { headers: NO_STORE_HEADERS }
  );
}
