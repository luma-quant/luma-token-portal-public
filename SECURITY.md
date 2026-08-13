# Security

## Security posture

This reference candidate is deliberately non-operational. Its primary control is capability removal:

- no wallet adapter, identity signature, or transaction signing;
- no payment, checkout, settlement, or value-transfer client;
- no token delivery, key issuance, redemption, or mint path;
- no backend, database, private endpoint, or environment-driven runtime URL;
- zero runtime and development package dependencies;
- no telemetry, cookies, browser storage, or source maps.

The page makes two same-origin reads for bundled JSON and fails closed if either strict contract is invalid.

## Automated controls

- exact candidate-source closure verification;
- exact Git-HEAD binding for private-source refresh;
- upstream byte-count and SHA-256 verification;
- raw RPC request/response SHA-256 binding;
- deny-by-default boundary and secret-like-content scan;
- deterministic SPDX 2.3 SBOM verification;
- zero-dependency package and lockfile verification plus `npm audit`;
- exact distribution allowlist, checksums, CSP and runtime capability scan;
- Gitleaks source and full-history scan;
- CodeQL JavaScript analysis prepared for a future public-repository phase with SARIF upload enabled only inside that public-only job.

Every GitHub Action is pinned to a full commit SHA. Global workflow permissions contain only `contents: read`; the public-only CodeQL job alone receives job-scoped `security-events: write` so it can upload SARIF when the repository is public. Gitleaks runs through a checksum-pinned CLI and does not use repository secrets or the GitHub pull-request API. CodeQL remains prepared behind a public-repository activation gate and must not be reported as passed before that job runs. Repository creation remains `PENDING`; the planned target does not imply publication, audit, deployment, or production parity.

## Threat model and limits

The controls detect accidental disclosure, source drift, unexpected files, package drift, secret patterns, unsafe runtime markers, and build-output expansion. They do not certify the private production system, smart-contract safety, legal compliance, treasury governance, operational security, or absence of all vulnerabilities.

`independent_audit` remains `NOT_YET_COMPLETED`. Internal automated checks must not be described as an independent audit.

## Reporting a concern

Report security concerns to `security@lumaquant.tech`. The operator confirms that
the mailbox is active, monitored and has passed a reception test. Independent
mailbox verification was not performed and no response-time SLA is claimed. Do
not disclose a vulnerability through a public issue when it could expose users
or operational systems.

## Publication blockers

Legal review and an independent third-party audit remain `NOT_YET_COMPLETED`.
Repository creation, publication and deployment have not occurred. Apply every
header in `SECURITY_HEADERS.json` if a future deployment is approved.
