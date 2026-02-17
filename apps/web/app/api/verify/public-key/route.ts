import { NextResponse } from "next/server";
import { getPublicKeyPem } from "@/lib/cert-sign";
import { NO_STORE_HEADERS } from "@/lib/no-store-headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const pem = getPublicKeyPem();
  if (!pem) {
    return NextResponse.json(
      { error: "Ed25519 public key not configured", message: "Set CERT_PRIVATE_KEY for signing." },
      { status: 503, headers: NO_STORE_HEADERS }
    );
  }
  return new NextResponse(pem, {
    headers: {
      "Content-Type": "application/x-pem-file",
      ...NO_STORE_HEADERS,
    },
  });
}
