# Changelog

## Post-publication status alignment - 2026-08-13

- Recorded the verified public repository and kept deployment `NOT_DEPLOYED` and production alignment `REFERENCE_ONLY`.
- Bound successful verification and CodeQL evidence to pre-status public head `64c73b23aa0e6039653079d2b321d4025c0758d9` and its immutable GitHub run URLs.
- Recorded a point-in-time result of zero open code-scanning alerts without making a self-referential CI claim for this later change.
- Kept exactly legal review and independent third-party audit open.

## v0.1.0-rc1 - 2026-08-13

- Reclassified the candidate as a narrow `REFERENCE_IMPLEMENTATION` with `REFERENCE_ONLY` production alignment.
- Replaced the incomplete upstream-only public manifest with an exact candidate source-tree closure.
- Preserved private-source provenance separately in `UPSTREAM_SOURCE_EVIDENCE.json`.
- Bound source refresh to the exact reviewed Git `HEAD` and immutable Git blobs.
- Added provider-neutral raw Solana RPC requests/responses with SHA-256 binding and no endpoint or credentials.
- Added explicit legal-review, independent-audit, production-alignment, and fact-status vocabularies.
- Declared repository, live-domain, independent-audit, legal-review, and license blockers truthfully.
- Recorded the planned `wotanIII/luma-token-portal-public` target with repository creation `PENDING`, `publication_performed: false`, `NOT_DEPLOYED` and `REFERENCE_ONLY`.
- Added full-SHA pinned Gitleaks and non-uploading CodeQL CI under read-only permissions.
- Replaced the pull-request API Gitleaks action with a checksum-pinned CLI and gated CodeQL on public repository eligibility.
- Added canonical Trust metadata aliases, an associated-domain field separated from `NOT_DEPLOYED`, and `NOTICE.md`.
- Added explicit zero-dependency lock verification and registry advisory audit.
- Documented the self-reference-safe digest, manifest, and SBOM design.
- Retained the read-only static boundary: no wallet, payment, fulfillment, key execution, mint, backend, admin, secrets, or source maps.

Applied the owner-confirmed operator identity, proprietary source-available
license, fail-closed asset rights and security contact. Only legal review and an
independent third-party audit remain open. Nothing was deployed, pushed or
published.
