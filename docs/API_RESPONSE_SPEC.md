# API response spec (audit-grade)

Exact response shapes for certification and verify endpoints. No trust leakage; audit-grade clarity.

---

## POST /api/certify

**Request body:** `{ "submission_id": string }`

**Success (200)**  
```json
{
  "cert_id": "<cuid>",
  "verify_url": "https://clanker.college/verify/<cuid>"
}
```
- No extra fields. No marketing. No “congratulations” copy.

**Production, signing not configured (503)**  
```json
{
  "error": "Signing not configured."
}
```
- Returned when `NODE_ENV=production` and `CERT_PRIVATE_KEY` is not set.

**Other errors (4xx)**  
- `400` — `{ "error": "Invalid JSON" }` or `{ "error": "Missing submission_id" }` or `{ "error": "Submission did not pass; cannot certify" }`
- `404` — `{ "error": "Submission not found" }`

All responses include:  
`Cache-Control: no-store, private`, `Pragma: no-cache`, `Vary: Authorization`.

---

## GET /api/verify/[certId]

**Success (200)**  
```json
{
  "cert_id": "<certId>",
  "pack_title": "Design System Architecture",
  "pack_version": "1.0.0",
  "score_total": 85,
  "score_by_dimension": {
    "token_discipline": 18,
    "component_contracts": 16,
    "accessibility_semantics": 14,
    "layout_grid": 13,
    "information_architecture": 10,
    "versioning_changelog": 9,
    "example_traceability": 5
  },
  "issued_at": "2025-02-16T12:00:00.000Z",
  "verify_hash": "<sha256 hex>",
  "signature": "<base64 or undefined if hash-only>",
  "verification_status": "verified",
  "hash_valid": true,
  "signature_valid": true
}
```
- `verification_status`: `"verified"` (Ed25519 valid), `"hash_verified"` (hash matches, no key), or `"invalid"`.
- `signature` omitted when not present (e.g. dev hash fallback).
- `signature_valid` only present when a public key is configured and a signature exists.
- No marketing. No “Certificate verified!” copy.

**Not found (404)**  
```json
{
  "error": "Certificate not found"
}
```

All responses include:  
`Cache-Control: no-store, private`, `Pragma: no-cache`, `Vary: Authorization`.
