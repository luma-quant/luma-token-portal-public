# Known Limitations

1. **Reference only.** This is a narrow static trust surface, not the complete Token Portal frontend and not a production deployment.
2. **Point-in-time evidence.** Chain facts are `VERIFIED_ON_CHAIN` only for the finalized observation at slot `438902191` and can change later.
3. **Role labels are operator claims.** Solana exposes account state, not the labels "Treasury vault" or "Sale wallet."
4. **Raw public balances are not financial claims.** The evidence contains point-in-time lamport fields, but no reserve, ownership, solvency, or allocation conclusion is made.
5. **Supply is easy to misread.** Total mint supply is not circulating supply, reserve allocation, offered inventory, or sales.
6. **Utility terms are operator claims.** Price, package, and LUMAKey rules are not encoded in the mint and are not executed here.
7. **No legal conclusion.** "Utility token" is an operator product description, not a regulatory opinion or guarantee. Legal review is `NOT_YET_COMPLETED`.
8. **No independent audit.** Automated and internal reviews have run, but `independent_audit` remains `NOT_YET_COMPLETED`.
9. **Forge is preview-only.** There is no achievement mode, AI provider, paid generation, NFT mint, transfer, marketplace, or ownership mutation.
10. **No authenticated demonstration.** Wallet-only Forge behavior is represented by evidence, not executed by this static page.
11. **Proprietary source-available license.** `LICENSE.md` permits transparency review but grants no general copying, modification, redistribution or deployment rights.
12. **Publication is not deployment parity.** The source repository is public and `https://token.lumaquant.tech` is the associated product domain, while this reference candidate remains `NOT_DEPLOYED` and `REFERENCE_ONLY`.
13. **CI evidence is point-in-time.** Verification and CodeQL passed on published baseline `64c73b23aa0e6039653079d2b321d4025c0758d9`; zero open code-scanning alerts were observed at the time recorded in `PUBLICATION_EVIDENCE.json`. A later commit requires its own run before the same claim applies to it.
