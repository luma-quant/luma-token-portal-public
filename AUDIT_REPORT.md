# Sanitization and Hardening Report

## Candidate

- Name: `luma-token-portal-trust-reference`
- Version: `v0.1.0-rc1`
- Release class: `REFERENCE_IMPLEMENTATION`
- Production alignment: `REFERENCE_ONLY`
- Private source commit: `b39c2d752abfc9a1c4d151db8519e7b070c7c869`
- Public repository: `https://github.com/wotanIII/luma-token-portal-public`, creation and visibility verified
- Associated live domain: `https://token.lumaquant.tech`; candidate deployment: `NOT_DEPLOYED`
- Independent audit: `NOT_YET_COMPLETED`
- Legal review: `NOT_YET_COMPLETED`
- Publication evidence: `PUBLICATION_EVIDENCE.json`, bound to public baseline `64c73b23aa0e6039653079d2b321d4025c0758d9`

## Intake decision

The private application is not suitable for whole-repository publication because it contains unrelated proprietary product code and operational wallet, value, identity, administration, and deployment surfaces.

The candidate uses a three-file allowlist and deny-by-default extraction. Only the Portal Forge contract client, its strict test, and the logo are copied verbatim. The public runtime is a separate non-operational reference implementation.

`UPSTREAM_SOURCE_EVIDENCE.json` records that narrow intake. `PUBLIC_SOURCE_MANIFEST.json` separately closes over every clean candidate-source file except itself, correcting the ambiguity of treating a three-file upstream manifest as a complete candidate inventory.

## Hardening controls

- release metadata names the product as `v0.1.0-rc1` reference-only material;
- repository, live-domain, audit, legal, license, and production-alignment statuses are explicit;
- private-source refresh requires the exact reviewed Git `HEAD` and reads immutable Git blobs;
- provider-neutral raw RPC requests and responses are included and SHA-256 bound without an endpoint or credentials;
- legal, independent-audit, production-alignment, and fact statuses use closed vocabularies;
- zero package dependencies are asserted from both package and lockfile;
- Gitleaks source/history scanning uses a checksum-pinned CLI without GitHub API access;
- CodeQL remains full-SHA pinned and completed successfully on the recorded public baseline;
- deterministic SBOM, exact output allowlist, checksums, CSP, and capability scans remain enforced.

## Owner decisions and open review matters

Operator identity, the proprietary source-available license, fail-closed asset
rights and `security@lumaquant.tech` are owner-confirmed; independent registry,
asset-rights and mailbox verification were not performed. On-chain facts are
`VERIFIED_ON_CHAIN` only for the recorded finalized observation; the price,
address roles, package values and utility rules remain `OPERATOR_DECLARED`.
`REAL_PAYMENTS_DISABLED` and `TOKEN_DELIVERY_DISABLED` are enforced candidate
boundaries.

Exactly two Trust Layer review matters remain open:

1. `LEGAL_REVIEW_NOT_YET_COMPLETED`.
2. `INDEPENDENT_THIRD_PARTY_AUDIT_NOT_YET_COMPLETED`.

Fresh chain evidence before later investor or marketing use and hosting-header
verification before deployment are operational maintenance controls, not extra
owner gates. Passing internal automated checks does not constitute an
independent audit.

The public baseline verification and CodeQL jobs passed in
`https://github.com/wotanIII/luma-token-portal-public/actions/runs/31691842203`,
and a point-in-time GitHub code-scanning query returned zero open alerts. These
facts are evidence for the pre-status baseline only; they do not pre-approve a
later commit.
