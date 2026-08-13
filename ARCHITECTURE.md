# Architecture

## Purpose

This candidate makes a small trust surface reviewable without publishing or emulating the operational application.

```text
Private frontend Git HEAD b39c2d7
        |
        | exact three-file allowlist
        v
UPSTREAM_SOURCE_EVIDENCE.json ---> byte count + SHA-256
        |
        | sanitized reimplementation
        v
Strict public contract ---> read-only static reference surface
        |
        +--- TOKEN_FACTS.json + raw provider-neutral RPC evidence
        +--- RELEASE.json (reference-only status + candidate digest)
        +--- PUBLIC_SOURCE_MANIFEST.json (exact candidate closure)
        +--- SBOM.spdx.json (zero package dependencies)
```

## Runtime

The built runtime is static:

1. `index.html` loads one local stylesheet and one local JavaScript module.
2. The module fetches only same-origin `TOKEN_FACTS.json` and `RELEASE.json`.
3. Strict parsers reject extra keys, invalid addresses, inconsistent units, unapproved statuses, unfinished release hashes, or any execution-enabled boundary.
4. Rendering uses DOM text nodes; bundled facts are never inserted as HTML.
5. A validation failure replaces every claim with a fail-closed message.

There is no API base URL, authentication client, wallet adapter, RPC client, payment SDK, analytics SDK, telemetry SDK, backend proxy, browser storage, cookie, or service worker.

## Evidence layers

`evidence/upstream/` contains three verbatim allowlisted private-source artifacts. `UPSTREAM_SOURCE_EVIDENCE.json` records their paths, sizes and digests. The refresher accepts only a separate Git worktree whose exact `HEAD` equals the reviewed private commit, and it copies the reviewed Git blobs rather than mutable worktree files.

`evidence/onchain/` contains provider-neutral request payloads and raw JSON-RPC responses. `TOKEN_FACTS.json` binds both files by SHA-256. No RPC URL, authentication value, or provider credential is stored.

`PUBLIC_SOURCE_MANIFEST.json` serves a different purpose: it closes over every file in the clean candidate source tree except itself and `.git` metadata. Keeping source evidence and candidate closure separate prevents the former three-file allowlist from being mistaken for a complete public manifest.

## Hash-cycle design

Self-referential files cannot truthfully hash themselves. The canonical candidate digest therefore excludes only `PUBLIC_SOURCE_MANIFEST.json` and `RELEASE.json`. The SBOM excludes itself plus those two metadata files. The public manifest then hashes every candidate file, including the finalized release and SBOM, while excluding only itself. This order removes hash cycles without leaving ordinary candidate content outside the manifest.

## Build

The dependency-free build copies an exact runtime allowlist into generated `dist/`, computes `SHA256SUMS`, and refuses unknown or source-map output. `verify-dist` scans built JavaScript and HTML for network, wallet, payment, signing, mint, storage, cookie, and private-route capabilities. Generated `dist/` is not committed and is removed before source-closure verification.
