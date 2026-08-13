export const EXPECTED_TOKEN_FACT_KEYS = Object.freeze([
  'schema',
  'observed_at',
  'status_vocabulary',
  'assurance_status',
  'observation',
  'raw_rpc_evidence',
  'asset',
  'operational_addresses',
  'utility_policy',
  'candidate_boundary',
  'links',
]);

export const FROZEN_FORGE_PREVIEW = Object.freeze({
  runtime: 'DETERMINISTIC_PREVIEW',
  candidate_count: 3,
  selectable_grades: Object.freeze(['RARE', 'EPIC']),
  earned_only_grades: Object.freeze(['LEGENDARY', 'MYTHIC']),
  paid_random: false,
  modes: Object.freeze(['GUIDED', 'SURPRISE']),
  themes: Object.freeze([
    'QUANTUM_CORE',
    'DATA_FRONTIER',
    'PROBABILITY_FIELD',
    'PERSONAL_CONSTELLATION',
  ]),
  achievement_mode_available: false,
  generation_payment_required: false,
  mint_enabled: false,
  mint_network: null,
  mint_cost_luma_atoms: null,
});

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, expected, label) {
  if (!isRecord(value)) throw new Error(`${label} is not an object.`);
  const actual = Object.keys(value).sort();
  const contract = [...expected].sort();
  if (actual.length !== contract.length || actual.some((key, index) => key !== contract[index])) {
    throw new Error(`${label} does not match the published schema.`);
  }
}

function exactString(value, expected, label) {
  if (value !== expected) throw new Error(`${label} is not the published value.`);
}

function sha256String(value, label) {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${label} is not a SHA-256 digest.`);
  }
}

function base58Address(value, label) {
  if (typeof value !== 'string' || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) {
    throw new Error(`${label} is not a canonical Solana address.`);
  }
  return value;
}

function evidencePath(value, label) {
  if (typeof value !== 'string' || !/^evidence\/[a-z0-9_./-]+$/i.test(value) || value.includes('..')) {
    throw new Error(`${label} is not a safe evidence path.`);
  }
}

function integerString(value, label) {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) {
    throw new Error(`${label} is not an integer string.`);
  }
  return value;
}

function exactArray(value, expected, label) {
  if (!Array.isArray(value) || JSON.stringify(value) !== JSON.stringify(expected)) {
    throw new Error(`${label} does not match the published values.`);
  }
}

export function parseTokenFacts(value) {
  exactKeys(value, EXPECTED_TOKEN_FACT_KEYS, 'TOKEN_FACTS');
  exactString(value.schema, 'luma-token-facts-v2', 'TOKEN_FACTS schema');
  if (typeof value.observed_at !== 'string' || !Number.isFinite(Date.parse(value.observed_at))) {
    throw new Error('TOKEN_FACTS observation time is invalid.');
  }

  const vocabulary = value.status_vocabulary;
  exactKeys(vocabulary, ['fact_status', 'legal_review_status', 'independent_audit_status', 'production_alignment_status'], 'status vocabulary');
  exactArray(vocabulary.fact_status, ['VERIFIED_ON_CHAIN', 'OPERATOR_DECLARED', 'NOT_INCLUDED'], 'fact status vocabulary');
  exactArray(vocabulary.legal_review_status, ['NOT_YET_COMPLETED', 'IN_PROGRESS', 'COMPLETED'], 'legal review vocabulary');
  exactArray(vocabulary.independent_audit_status, ['NOT_YET_COMPLETED', 'IN_PROGRESS', 'COMPLETED'], 'independent audit vocabulary');
  exactArray(vocabulary.production_alignment_status, ['REFERENCE_ONLY', 'PARTIALLY_ALIGNED', 'PRODUCTION_ALIGNED'], 'production alignment vocabulary');

  const assurance = value.assurance_status;
  exactKeys(assurance, ['chain_facts', 'operator_policy', 'legal_review', 'independent_audit', 'production_alignment'], 'assurance status');
  exactString(assurance.chain_facts, 'VERIFIED_ON_CHAIN', 'chain fact status');
  exactString(assurance.operator_policy, 'OPERATOR_DECLARED', 'operator policy status');
  exactString(assurance.legal_review, 'NOT_YET_COMPLETED', 'legal review status');
  exactString(assurance.independent_audit, 'NOT_YET_COMPLETED', 'independent audit status');
  exactString(assurance.production_alignment, 'REFERENCE_ONLY', 'production alignment status');

  const observation = value.observation;
  exactKeys(observation, ['network', 'commitment', 'account_slot', 'supply_slot', 'rpc_api_version', 'evidence_kind'], 'observation');
  exactString(observation.network, 'solana-mainnet', 'network');
  exactString(observation.commitment, 'finalized', 'commitment');
  if (!Number.isSafeInteger(observation.account_slot) || observation.account_slot < 1) throw new Error('Account slot is invalid.');
  if (!Number.isSafeInteger(observation.supply_slot) || observation.supply_slot < observation.account_slot) throw new Error('Supply slot is invalid.');
  exactString(observation.evidence_kind, 'read-only-rpc-observation', 'evidence kind');

  const rawEvidence = value.raw_rpc_evidence;
  exactKeys(rawEvidence, [
    'request_path', 'request_sha256', 'response_path', 'response_sha256',
    'endpoint_disclosed', 'credentials_included', 'source_description',
  ], 'raw RPC evidence');
  evidencePath(rawEvidence.request_path, 'RPC request path');
  evidencePath(rawEvidence.response_path, 'RPC response path');
  sha256String(rawEvidence.request_sha256, 'RPC request digest');
  sha256String(rawEvidence.response_sha256, 'RPC response digest');
  if (rawEvidence.endpoint_disclosed !== false || rawEvidence.credentials_included !== false) {
    throw new Error('RPC evidence must not publish endpoint or credentials.');
  }

  const asset = value.asset;
  exactKeys(asset, [
    'display_name', 'symbol', 'classification', 'classification_status', 'onchain_status',
    'mint_address', 'token_program', 'decimals', 'initialized', 'supply_atoms',
    'supply_display', 'mint_authority', 'freeze_authority', 'fact_provenance',
  ], 'asset');
  exactString(asset.symbol, 'LUMA', 'symbol');
  exactString(asset.classification, 'operator-described utility token', 'classification');
  exactString(asset.classification_status, 'OPERATOR_DECLARED', 'classification status');
  exactString(asset.onchain_status, 'VERIFIED_ON_CHAIN', 'on-chain status');
  base58Address(asset.mint_address, 'mint address');
  base58Address(asset.token_program, 'token program');
  base58Address(asset.mint_authority, 'mint authority');
  base58Address(asset.freeze_authority, 'freeze authority');
  if (asset.decimals !== 6 || asset.initialized !== true) throw new Error('Mint state is invalid.');
  integerString(asset.supply_atoms, 'supply atoms');
  if (asset.supply_display !== '734614848') throw new Error('Supply display does not match the observation.');
  if (BigInt(asset.supply_atoms) !== BigInt(asset.supply_display) * 1_000_000n) {
    throw new Error('Supply atoms do not match six-decimal display units.');
  }

  if (!Array.isArray(value.operational_addresses) || value.operational_addresses.length !== 2) {
    throw new Error('Operational address evidence is incomplete.');
  }
  for (const entry of value.operational_addresses) {
    exactKeys(entry, [
      'label', 'address', 'role_status', 'account_status', 'account_owner',
      'executable', 'balance_in_raw_evidence', 'balance_interpretation',
    ], 'operational address');
    base58Address(entry.address, `${entry.label ?? 'operational'} address`);
    exactString(entry.role_status, 'OPERATOR_DECLARED', 'role status');
    exactString(entry.account_status, 'VERIFIED_ON_CHAIN', 'account status');
    exactString(entry.balance_interpretation, 'NOT_INCLUDED', 'balance interpretation');
    if (entry.executable !== false || entry.balance_in_raw_evidence !== true) {
      throw new Error('Operational address boundary is invalid.');
    }
  }

  const policy = value.utility_policy;
  exactKeys(policy, [
    'status', 'provenance', 'encoded_in_mint', 'reference_price_usdc_per_luma',
    'lumakey_cost_atoms', 'lumakey_cost_display', 'lumakey_credit_entitlement',
    'sale_package_usdc', 'custom_sale_minimum_usdc', 'execution_in_candidate',
  ], 'utility policy');
  exactString(policy.status, 'OPERATOR_DECLARED', 'utility policy status');
  exactString(policy.provenance, 'operator-declared product configuration', 'utility provenance');
  if (policy.encoded_in_mint !== false || policy.execution_in_candidate !== false) {
    throw new Error('Utility policy must remain non-executable in this candidate.');
  }
  exactString(policy.reference_price_usdc_per_luma, '0.0066', 'reference price');
  exactString(policy.lumakey_cost_atoms, '3787878787', 'LUMAKey atom cost');
  exactString(policy.lumakey_cost_display, '3787.878787', 'LUMAKey display cost');
  if (policy.lumakey_credit_entitlement !== 1250) throw new Error('LUMAKey credit entitlement is invalid.');
  exactArray(policy.sale_package_usdc, [25, 100, 500], 'sale packages');
  if (policy.custom_sale_minimum_usdc !== 500) throw new Error('Custom package floor is invalid.');

  const boundary = value.candidate_boundary;
  exactKeys(boundary, ['status', 'wallet_connection', 'payments', 'token_delivery', 'key_issuance', 'nft_minting', 'transaction_signing', 'backend_included', 'real_payments_status', 'token_delivery_status'], 'candidate boundary');
  exactString(boundary.status, 'REFERENCE_ONLY', 'candidate boundary status');
  for (const field of ['wallet_connection', 'payments', 'token_delivery', 'key_issuance', 'nft_minting', 'transaction_signing', 'backend_included']) {
    if (boundary[field] !== false) throw new Error(`Candidate boundary ${field} must be false.`);
  }
  exactString(boundary.real_payments_status, 'REAL_PAYMENTS_DISABLED', 'real payment status');
  exactString(boundary.token_delivery_status, 'TOKEN_DELIVERY_DISABLED', 'token delivery status');

  exactKeys(value.links, ['solana_rpc_docs', 'mint_explorer'], 'links');
  return Object.freeze(value);
}

export function parseRelease(value) {
  exactKeys(value, [
    'schema', 'name', 'version', 'public_release', 'status', 'release_class', 'repository',
    'repository_url', 'repository_creation_status', 'repository_visibility', 'repository_purpose',
    'repository_review_state', 'repository_status', 'live_domain', 'deployment_status',
    'source_private_commit_sha', 'candidate_sha256', 'public_candidate_sha256',
    'candidate_sha256_scope', 'exported_at', 'exported_at_utc', 'production_alignment', 'detailed_alignment',
    'separate_engine_e4_milestone',
    'independent_audit', 'legal_review', 'operator_identity_status', 'operator_identity',
    'license_status', 'rights_status', 'asset_rights_status',
    'asset_rights_inventory_sha256', 'security_contact',
    'security_contact_status', 'security_contact_independent_verification',
    'owner_decision_manifest_sha256', 'external_publish_authorized',
    'publication_review_status', 'publication_status', 'publication_performed',
    'publication_evidence_file', 'publication_evidence_sha256',
    'open_review_matters', 'publish_state', 'execution_profile',
    'real_payments_status', 'token_delivery_status', 'verification',
  ], 'RELEASE');
  exactString(value.schema, 'luma-public-candidate-release-v2', 'release schema');
  exactString(value.name, 'luma-token-portal-trust-reference', 'release name');
  exactString(value.version, 'v0.1.0-rc1', 'release version');
  exactString(value.public_release, '0.1.0-rc1', 'public release');
  exactString(value.status, 'PUBLIC_REFERENCE_PUBLISHED', 'release status');
  exactString(value.release_class, 'REFERENCE_IMPLEMENTATION', 'release class');
  exactString(value.repository, 'wotanIII/luma-token-portal-public', 'repository identity');
  exactString(value.repository_url, ['https:', '', 'github.com', value.repository].join('/'), 'repository URL');
  exactString(value.repository_creation_status, 'COMPLETED_VERIFIED', 'repository creation status');
  exactString(value.repository_visibility, 'PUBLIC_VERIFIED', 'repository visibility');
  exactString(value.repository_purpose, 'TRUST_LAYER_V1_PUBLIC_SOURCE', 'repository purpose');
  exactString(value.repository_review_state, 'PUBLIC_REFERENCE_PUBLISHED', 'repository review state');
  exactString(value.repository_status, 'PUBLIC_REPOSITORY_PUBLISHED', 'repository status');
  exactString(value.live_domain, 'https://token.lumaquant.tech', 'associated live domain');
  exactString(value.deployment_status, 'NOT_DEPLOYED', 'candidate deployment status');
  exactString(value.production_alignment, 'REFERENCE_ONLY', 'production alignment');
  exactString(value.detailed_alignment, 'READ_ONLY_REFERENCE_SURFACE_ASSOCIATED_WITH_DOMAIN_NO_DEPLOYMENT_PARITY_CLAIM', 'detailed alignment');
  exactKeys(value.separate_engine_e4_milestone, ['status', 'scope', 'public_repository_gate', 'required_before_claim'], 'separate Engine E4 milestone');
  exactString(value.separate_engine_e4_milestone.status, 'NOT_YET_COMPLETED', 'Engine E4 status');
  exactString(value.separate_engine_e4_milestone.scope, 'SEPARATE_ENGINE_EVIDENCE_MILESTONE', 'Engine E4 scope');
  if (value.separate_engine_e4_milestone.public_repository_gate !== false) throw new Error('Engine E4 must remain separate from repository publication.');
  exactString(value.separate_engine_e4_milestone.required_before_claim, 'PROSPECTIVELY_DEMONSTRATED', 'Engine E4 claim gate');
  exactString(value.independent_audit, 'NOT_YET_COMPLETED', 'independent audit');
  exactString(value.legal_review, 'NOT_YET_COMPLETED', 'legal review');
  exactString(value.operator_identity_status, 'COMPLETED_OWNER_CONFIRMED', 'operator identity status');
  exactKeys(value.operator_identity, ['brand', 'legal_operator', 'founder', 'jurisdiction', 'independent_registry_verification'], 'operator identity');
  exactString(value.operator_identity.legal_operator, 'Luma Quant e.U.', 'legal operator');
  exactString(value.operator_identity.independent_registry_verification, 'NOT_PERFORMED', 'registry verification');
  exactString(value.license_status, 'PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED', 'license status');
  exactString(value.rights_status, 'PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED', 'rights status');
  exactString(value.asset_rights_status, 'COMPLETED_OWNER_CONFIRMED_FAIL_CLOSED', 'asset rights status');
  sha256String(value.asset_rights_inventory_sha256, 'asset rights inventory digest');
  exactString(value.security_contact, 'security@lumaquant.tech', 'security contact');
  exactString(value.security_contact_status, 'COMPLETED_OWNER_CONFIRMED', 'security contact status');
  exactString(value.security_contact_independent_verification, 'NOT_PERFORMED', 'mailbox verification');
  sha256String(value.owner_decision_manifest_sha256, 'owner decision manifest digest');
  if (value.external_publish_authorized !== true) throw new Error('Owner publication authorization is missing.');
  exactString(value.publication_review_status, 'PUBLICATION_REVIEW_READY', 'publication review status');
  exactString(value.publication_status, 'PUBLIC_REPOSITORY_PUBLISHED', 'publication status');
  if (value.publication_performed !== true) throw new Error('Verified publication must be recorded as performed.');
  exactString(value.publication_evidence_file, 'PUBLICATION_EVIDENCE.json', 'publication evidence path');
  sha256String(value.publication_evidence_sha256, 'publication evidence digest');
  exactArray(value.open_review_matters, ['LEGAL_REVIEW_NOT_YET_COMPLETED', 'INDEPENDENT_THIRD_PARTY_AUDIT_NOT_YET_COMPLETED'], 'open review matters');
  exactString(value.publish_state, 'PUBLIC_REPOSITORY_PUBLISHED', 'publish state');
  exactString(value.execution_profile, 'READ_ONLY_STATIC_NO_WALLET_NO_PAYMENT_NO_MINT', 'execution profile');
  exactString(value.real_payments_status, 'REAL_PAYMENTS_DISABLED', 'real payment status');
  exactString(value.token_delivery_status, 'TOKEN_DELIVERY_DISABLED', 'token delivery status');
  if (!/^[0-9a-f]{40}$/.test(value.source_private_commit_sha)) throw new Error('Source commit is invalid.');
  sha256String(value.candidate_sha256, 'Candidate digest');
  exactString(value.public_candidate_sha256, value.candidate_sha256, 'canonical candidate digest alias');
  if (/^0+$/.test(value.candidate_sha256)) throw new Error('Candidate digest is not finalized.');
  if (typeof value.exported_at !== 'string' || !Number.isFinite(Date.parse(value.exported_at))) throw new Error('Release export time is invalid.');
  exactString(value.exported_at_utc, value.exported_at, 'canonical export time alias');
  exactKeys(value.verification, [
    'public_source_closure', 'upstream_source_hashes', 'boundary_scan',
    'history_secret_scan', 'source_secret_scan', 'zero_dependency_audit',
    'codeql', 'tests', 'build', 'dist_scan', 'sbom',
  ], 'release verification');
  for (const [key, status] of Object.entries(value.verification)) {
    const expected = key === 'codeql' ? 'PASSED_ON_PUBLISHED_PRE_STATUS_HEAD' : 'PASSED';
    exactString(status, expected, `${key} verification`);
  }
  return Object.freeze(value);
}
