# Public / Private Boundary

## Public in this reference candidate

| Area | Published material | Provenance / status |
|---|---|---|
| Token identity | Mint, Token Program, six decimals, initialized state | `VERIFIED_ON_CHAIN`; finalized point-in-time raw RPC response is SHA-256 bound |
| Token supply | `734614848000000` atoms / `734614848` display units at slot `438902191` | `VERIFIED_ON_CHAIN`; total supply only |
| Authorities | Mint and freeze authority addresses | Parsed on-chain mint fields |
| Operational addresses | Treasury and sale public keys plus point-in-time raw account records | Account state observed; roles `OPERATOR_DECLARED` |
| Utility policy | `0.0066`, fixed LUMAKey cost, 1,250-credit entitlement, package sizes | `OPERATOR_DECLARED`; not encoded in mint or executed here |
| Forge preview | Guided/Surprise, Rare/Epic, exactly three deterministic candidates | Frozen reviewed contract; no payment or mint |
| Source evidence | Portal Forge client, contract test and logo | Verbatim private-source blobs pinned by SHA-256 |
| Candidate closure | Every clean source-candidate file except the manifest itself | `PUBLIC_SOURCE_MANIFEST.json` |

## Private and excluded

| Area | Why it remains private |
|---|---|
| Backend services, workers, database models and migrations | Operational implementation and attack surface |
| Authentication, session persistence and wallet-provider integration | Identity and security-sensitive execution |
| Transaction preparation, signing, relay and reconciliation | Mainnet value movement is outside this reference candidate |
| SOL/USDC checkout, pricing execution and token fulfillment | Financial execution is intentionally excluded |
| LUMAKey issuance, reveal, recovery and redemption | Secret-bearing and entitlement operations |
| Treasury controls and signer material | Security-sensitive operations |
| Administration, monitoring, fraud controls and rate limits | Internal control plane |
| Quant Lab, Advisor, analytics, credits and workspace source | Unrelated proprietary product code |
| Deployment configuration, environment files and private route catalogs | Infrastructure boundary |
| RPC endpoint and credentials | Requests remain replayable without disclosing provider configuration |

## Important distinctions

- This is `REFERENCE_IMPLEMENTATION` / `REFERENCE_ONLY`, not the full frontend and not evidence of production alignment.
- A public address can be observed on-chain, but its business role is not an on-chain fact.
- Raw account responses expose point-in-time public lamport values; the candidate makes no treasury-balance, reserve, solvency, or allocation claim from them.
- Total mint supply is not circulating supply, offered inventory, treasury reserve, or sold amount.
- A configured reference price is not an exchange price, valuation, legal classification, or promise of liquidity.
- A visual grade is not a financial rarity claim.
- Legal review and independent audit are both `NOT_YET_COMPLETED`.
- The proprietary source-available license grants transparency review access,
  not general reuse or redistribution rights.
- Real payments and token delivery are explicitly disabled in this candidate.

Anything not explicitly listed in `ALLOWLIST.json` is excluded from private-source intake by default.
