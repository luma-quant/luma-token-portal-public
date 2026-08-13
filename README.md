# LUMA Token Portal Trust Reference

`v0.1.0-rc1` is a sanitized, read-only **reference implementation** built from the private LUMA Quant frontend at commit `b39c2d752abfc9a1c4d151db8519e7b070c7c869`.

It is deliberately narrow. It is not the complete Token Portal frontend, is not production-aligned, is not deployed by this candidate, and has not completed independent audit or legal review. It is associated with `https://token.lumaquant.tech`, but that association is not a deployment or parity claim. The reference source is published at `https://github.com/luma-quant/luma-token-portal-public`; `PUBLICATION_EVIDENCE.json` records the verified public baseline and its successful checks without claiming that this later organization-alignment commit has already run CI.

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
- public repository: `https://github.com/luma-quant/luma-token-portal-public`, creation and public visibility verified;
- associated live domain: `https://token.lumaquant.tech`;
- candidate deployment: `NOT_DEPLOYED`;
- license and rights: `PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED`;
- real payments: `REAL_PAYMENTS_DISABLED`;
- token delivery: `TOKEN_DELIVERY_DISABLED`.

Only legal review and an independent third-party audit remain open review
matters. The first prospective Engine E4 milestone is separately incomplete;
it is not a public-repository gate and is required only before the stronger
`PROSPECTIVELY_DEMONSTRATED` claim.

This public source-available material must not be described as an audited production frontend or as open source.

## Verify locally

Node.js 22 or newer is sufficient. There are zero runtime and development package dependencies.

```text
npm run verify:closure
npm run verify:dependencies
npm run check
npm run audit:packages
```

`npm run check` removes generated `dist/`, verifies the exact public-source closure, upstream hashes, zero-dependency lock, pinned read-only CI, disclosure boundary and deterministic SBOM, runs the contract tests, builds the static surface, and scans the exact output.

The public CI runs full-history Gitleaks through a checksum-pinned CLI that does not call the GitHub pull-request API. All third-party actions are pinned to full commit SHAs. On published baseline `64c73b23aa0e6039653079d2b321d4025c0758d9`, the verification and CodeQL jobs completed successfully in [run 31691842203](https://github.com/luma-quant/luma-token-portal-public/actions/runs/31691842203), and the point-in-time code-scanning query recorded zero open alerts. Repository permissions remain read-only. These results are bound to that baseline, not self-referentially to this later organization-alignment change.

## Provenance

- `PUBLIC_SOURCE_MANIFEST.json` is the exact closure of every file in the clean candidate source tree except the manifest itself and Git metadata.
- `UPSTREAM_SOURCE_EVIDENCE.json` separately records the three verbatim files selected from the private repository.
- `ALLOWLIST.json` is the entire private-source intake list; `DENYLIST.json` excludes everything else.
- `TOKEN_FACTS.json` separates observed facts, operator declarations, review status, and non-included claims.
- `RELEASE.json` binds the candidate to the private source commit and a canonical candidate digest.
- `SBOM.spdx.json` inventories the non-self-referential source closure and confirms zero package dependencies.

Read `PUBLIC_PRIVATE_BOUNDARY.md`, `SECURITY.md`, and `KNOWN_LIMITATIONS.md` when evaluating this repository. Public repository publication is verified; no GitHub release, cloud deployment or live service was created by this candidate build, and the associated domain exists independently of this reference package. Source availability is governed by `LICENSE.md` and grants no general reuse rights.

## Trust links and remaining proprietary systems

The public Trust Layer index is `https://github.com/luma-quant/luma-trust-layer-v1`
and the Engine Evidence repository is
`https://github.com/luma-quant/luma-engine-evidence-public`. The private
production frontend, backend, analytical engine, prompts, deployment controls,
payment and signing systems, administration, antifraud, support tooling and all
customer or wallet data remain proprietary and excluded. `KNOWN_LIMITATIONS.md`
and `PUBLIC_PRIVATE_BOUNDARY.md` are the authoritative review documents.
