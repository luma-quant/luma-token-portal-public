# LUMA Token Portal Trust Reference

`v0.1.0-rc1` is a sanitized, read-only **reference implementation** built from the private LUMA Quant frontend at commit `b39c2d752abfc9a1c4d151db8519e7b070c7c869`.

It is deliberately narrow. It is not the complete Token Portal frontend, is not production-aligned, is not deployed by this candidate, and has not completed independent audit or legal review. It is associated with `https://token.lumaquant.tech`, but that association is not a deployment or parity claim. The planned public repository is `https://github.com/wotanIII/luma-token-portal-public`; creation remains `PENDING` and publication has not occurred.

The candidate publishes only:

- finalized, point-in-time Solana mint and account evidence classified `VERIFIED_ON_CHAIN` for that observation only;
- provider-neutral raw JSON-RPC requests and responses, bound by SHA-256 without an endpoint or credentials;
- clearly labelled operator-declared address roles and utility policy;
- the frozen free deterministic Forge preview policy;
- verbatim evidence for the reviewed Portal Forge client and its contract test;
- the exact public logo asset used by the source application.

It cannot connect a wallet, accept SOL or USDC, deliver LUMA, issue or redeem a LUMAKey, mint an NFT, call a backend, or sign a transaction.

## Release truth

`RELEASE.json` is authoritative:

- release class: `REFERENCE_IMPLEMENTATION`;
- production alignment: `REFERENCE_ONLY`;
- independent audit: `NOT_YET_COMPLETED`;
- legal review: `NOT_YET_COMPLETED`;
- repository target: `wotanIII/luma-token-portal-public`, creation `PENDING`;
- associated live domain: `https://token.lumaquant.tech`;
- candidate deployment: `NOT_DEPLOYED`;
- license and rights: `PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED`;
- real payments: `REAL_PAYMENTS_DISABLED`;
- token delivery: `TOKEN_DELIVERY_DISABLED`.

This material must not be shared as an audited production frontend or as an open-source release.

## Verify locally

Node.js 22 or newer is sufficient. There are zero runtime and development package dependencies.

```text
npm run verify:closure
npm run verify:dependencies
npm run check
npm run audit:packages
```

`npm run check` removes generated `dist/`, verifies the exact public-source closure, upstream hashes, zero-dependency lock, pinned read-only CI, disclosure boundary and deterministic SBOM, runs the contract tests, builds the static surface, and scans the exact output.

The prepared CI runs full-history Gitleaks through a checksum-pinned CLI that does not call the GitHub pull-request API. All third-party actions are pinned to full commit SHAs. CodeQL remains prepared behind the public-repository eligibility gate and must not be described as passed before that job runs. Repository permissions remain read-only.

## Provenance

- `PUBLIC_SOURCE_MANIFEST.json` is the exact closure of every file in the clean candidate source tree except the manifest itself and Git metadata.
- `UPSTREAM_SOURCE_EVIDENCE.json` separately records the three verbatim files selected from the private repository.
- `ALLOWLIST.json` is the entire private-source intake list; `DENYLIST.json` excludes everything else.
- `TOKEN_FACTS.json` separates observed facts, operator declarations, review status, and non-included claims.
- `RELEASE.json` binds the candidate to the private source commit and a canonical candidate digest.
- `SBOM.spdx.json` inventories the non-self-referential source closure and confirms zero package dependencies.

Read `PUBLIC_PRIVATE_BOUNDARY.md`, `SECURITY.md`, and `KNOWN_LIMITATIONS.md` before publication. No repository, GitHub release, cloud deployment or live service was created by this candidate build; the associated domain exists independently of this reference package. Source availability is governed by `LICENSE.md` and grants no general reuse rights.

## Trust links and remaining proprietary systems

The final public Trust Center and Engine Evidence repository URLs are pending
repository creation/publication and verified URL availability; this candidate
does not imply that pending links are already live. The private
production frontend, backend, analytical engine, prompts, deployment controls,
payment and signing systems, administration, antifraud, support tooling and all
customer or wallet data remain proprietary and excluded. `KNOWN_LIMITATIONS.md`
and `PUBLIC_PRIVATE_BOUNDARY.md` are the authoritative review documents.
