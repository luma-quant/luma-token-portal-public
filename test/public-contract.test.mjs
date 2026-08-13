import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { FROZEN_FORGE_PREVIEW, parseRelease, parseTokenFacts } from '../src/public-contract.mjs';

const root = path.resolve(import.meta.dirname, '..');
const facts = JSON.parse(await readFile(path.join(root, 'TOKEN_FACTS.json'), 'utf8'));
const release = JSON.parse(await readFile(path.join(root, 'RELEASE.json'), 'utf8'));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

test('published token facts are strict and internally consistent', () => {
  const parsed = parseTokenFacts(facts);
  assert.equal(parsed.asset.mint_address, 'CuQkxCi19mw57e6c9HDrKGfbGapCUSxK5cTmK6uyDPhW');
  assert.equal(parsed.asset.decimals, 6);
  assert.equal(parsed.asset.supply_atoms, '734614848000000');
  assert.equal(parsed.asset.supply_display, '734614848');
  assert.equal(parsed.asset.mint_authority, parsed.asset.freeze_authority);
  assert.equal(parsed.assurance_status.chain_facts, 'VERIFIED_ON_CHAIN');
  assert.equal(parsed.candidate_boundary.transaction_signing, false);
  assert.equal(parsed.candidate_boundary.real_payments_status, 'REAL_PAYMENTS_DISABLED');
  assert.equal(parsed.candidate_boundary.token_delivery_status, 'TOKEN_DELIVERY_DISABLED');
});

test('legal, audit and production statuses use an explicit closed vocabulary', () => {
  const parsed = parseTokenFacts(facts);
  assert.deepEqual(parsed.status_vocabulary.legal_review_status, ['NOT_YET_COMPLETED', 'IN_PROGRESS', 'COMPLETED']);
  assert.deepEqual(parsed.status_vocabulary.independent_audit_status, ['NOT_YET_COMPLETED', 'IN_PROGRESS', 'COMPLETED']);
  assert.equal(parsed.assurance_status.legal_review, 'NOT_YET_COMPLETED');
  assert.equal(parsed.assurance_status.independent_audit, 'NOT_YET_COMPLETED');
  assert.equal(parsed.assurance_status.production_alignment, 'REFERENCE_ONLY');
});

test('raw RPC request and response files are SHA-256 bound to TOKEN_FACTS', async () => {
  const requestBytes = await readFile(path.join(root, facts.raw_rpc_evidence.request_path));
  const responseBytes = await readFile(path.join(root, facts.raw_rpc_evidence.response_path));
  assert.equal(sha256(requestBytes), facts.raw_rpc_evidence.request_sha256);
  assert.equal(sha256(responseBytes), facts.raw_rpc_evidence.response_sha256);
  assert.equal(facts.raw_rpc_evidence.endpoint_disclosed, false);
  assert.equal(facts.raw_rpc_evidence.credentials_included, false);
});

test('raw finalized RPC values reproduce the published mint facts', async () => {
  const responses = JSON.parse(await readFile(path.join(root, facts.raw_rpc_evidence.response_path), 'utf8'));
  const mint = responses.find((entry) => entry.id === 'mint-account').result;
  const supply = responses.find((entry) => entry.id === 'token-supply').result;
  const accounts = responses.find((entry) => entry.id === 'operational-accounts').result;
  assert.equal(mint.context.slot, facts.observation.account_slot);
  assert.equal(supply.context.slot, facts.observation.supply_slot);
  assert.equal(mint.value.owner, facts.asset.token_program);
  assert.equal(mint.value.data.parsed.info.supply, facts.asset.supply_atoms);
  assert.equal(supply.value.uiAmountString, facts.asset.supply_display);
  assert.equal(mint.value.data.parsed.info.mintAuthority, facts.asset.mint_authority);
  assert.equal(mint.value.data.parsed.info.freezeAuthority, facts.asset.freeze_authority);
  assert.deepEqual(accounts.value.map((entry) => entry.owner), facts.operational_addresses.map((entry) => entry.account_owner));
});

test('public parser rejects extra claims, enabled execution and unapproved status', () => {
  assert.throws(() => parseTokenFacts({ ...facts, market_value: 'guaranteed' }), /published schema/);
  assert.throws(() => parseTokenFacts({
    ...facts,
    candidate_boundary: { ...facts.candidate_boundary, payments: true },
  }), /must be false/);
  assert.throws(() => parseTokenFacts({
    ...facts,
    assurance_status: { ...facts.assurance_status, legal_review: 'APPROVED' },
  }), /published value/);
  assert.throws(() => parseTokenFacts({
    ...facts,
    asset: { ...facts.asset, supply_atoms: '734614848000001' },
  }), /Supply atoms/);
});

test('operator price math is floor-bounded and remains non-executable', () => {
  const usdcAtoms = 25_000_000n;
  const lumaAtoms = (usdcAtoms * 1_000_000n) / 6_600n;
  const remainder = (usdcAtoms * 1_000_000n) % 6_600n;
  assert.equal(lumaAtoms.toString(), facts.utility_policy.lumakey_cost_atoms);
  assert.equal(remainder, 5_800n);
  assert.equal(facts.utility_policy.execution_in_candidate, false);
});

test('Forge preview is exactly three, selectable Rare/Epic and never paid or minted', () => {
  assert.equal(FROZEN_FORGE_PREVIEW.candidate_count, 3);
  assert.deepEqual(FROZEN_FORGE_PREVIEW.selectable_grades, ['RARE', 'EPIC']);
  assert.deepEqual(FROZEN_FORGE_PREVIEW.earned_only_grades, ['LEGENDARY', 'MYTHIC']);
  assert.equal(FROZEN_FORGE_PREVIEW.paid_random, false);
  assert.equal(FROZEN_FORGE_PREVIEW.generation_payment_required, false);
  assert.equal(FROZEN_FORGE_PREVIEW.mint_enabled, false);
  assert.equal(FROZEN_FORGE_PREVIEW.achievement_mode_available, false);
});

test('release is publication-review-ready without claiming repository creation or deployment', async () => {
  const parsed = parseRelease(release);
  assert.equal(parsed.source_private_commit_sha, 'b39c2d752abfc9a1c4d151db8519e7b070c7c869');
  assert.equal(parsed.version, 'v0.1.0-rc1');
  assert.equal(parsed.public_release, '0.1.0-rc1');
  assert.equal(parsed.release_class, 'REFERENCE_IMPLEMENTATION');
  assert.equal(parsed.repository, 'wotanIII/luma-token-portal-public');
  assert.equal(parsed.repository_url, 'https://github.com/wotanIII/luma-token-portal-public');
  assert.equal(parsed.repository_creation_status, 'PENDING');
  assert.equal(parsed.repository_visibility, 'PUBLIC_REPOSITORY_PENDING');
  assert.equal(parsed.repository_purpose, 'TRUST_LAYER_V1_PUBLIC_SOURCE');
  assert.equal(parsed.live_domain, 'https://token.lumaquant.tech');
  assert.equal(parsed.deployment_status, 'NOT_DEPLOYED');
  assert.equal(parsed.production_alignment, 'REFERENCE_ONLY');
  assert.equal(parsed.public_candidate_sha256, parsed.candidate_sha256);
  assert.equal(parsed.exported_at_utc, parsed.exported_at);
  assert.equal(parsed.independent_audit, 'NOT_YET_COMPLETED');
  assert.equal(parsed.license_status, 'PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED');
  assert.equal(parsed.rights_status, 'PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED');
  assert.equal(parsed.security_contact, 'security@lumaquant.tech');
  assert.equal(parsed.asset_rights_inventory_sha256, sha256(await readFile(path.join(root, 'ASSET_RIGHTS_INVENTORY.json'))));
  assert.equal(parsed.publication_status, 'PUBLIC_REPOSITORY_PENDING');
  assert.equal(parsed.publication_performed, false);
  assert.deepEqual(parsed.publication_blockers, [
    'LEGAL_REVIEW_NOT_YET_COMPLETED',
    'INDEPENDENT_THIRD_PARTY_AUDIT_NOT_YET_COMPLETED',
  ]);
});

test('the only bundled asset has exact owner-confirmed rights evidence', async () => {
  const inventory = JSON.parse(await readFile(path.join(root, 'ASSET_RIGHTS_INVENTORY.json'), 'utf8'));
  const logo = await readFile(path.join(root, 'public/logo-1.webp'));
  assert.equal(inventory.asset_count, 1);
  assert.equal(inventory.unresolved_asset_count, 0);
  assert.deepEqual(inventory.assets, [{
    path: 'public/logo-1.webp',
    bytes: logo.length,
    sha256: sha256(logo),
    status: 'OWNED',
    attestation: 'OWNER_CONFIRMED',
  }]);
});

test('candidate contains no obsolete publication labels or repository metadata', async () => {
  const { readdir } = await import('node:fs/promises');
  const forbidden = [
    'private' + '-review',
    'private' + ' review',
    'private' + ' staging',
    'private' + '_staging',
    'private' + '_external_review',
    'ready_for_external_review_' + 'private',
    'draft' + '_pr',
    'draft pull' + ' request',
    'pending owner' + ' approval',
  ];
  const findings = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'dist' || entry.name === 'node_modules') continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else {
        let text;
        try { text = (await readFile(absolute, 'utf8')).toLowerCase(); } catch { continue; }
        for (const marker of forbidden) if (text.includes(marker)) findings.push(`${path.relative(root, absolute)}:${marker}`);
        const oldRepository = new RegExp('wotaniii/luma-token-' + 'portal(?!-public)');
        if (oldRepository.test(text)) findings.push(`${path.relative(root, absolute)}:old-repository`);
      }
    }
  }
  await walk(root);
  assert.deepEqual(findings, []);
});

test('source refresher reads reviewed blobs only after exact Git HEAD binding', async () => {
  const refresher = await readFile(path.join(root, 'scripts/refresh-public-source.mjs'), 'utf8');
  assert.match(refresher, /rev-parse', 'HEAD'/);
  assert.match(refresher, /head !== manifest\.source_private_commit_sha/);
  assert.match(refresher, /'show', `\$\{head\}:\$\{allowed\.source\}`/);
  assert.doesNotMatch(refresher, /copyFile|readFile\(source\)/);
});

test('runtime has no backend, wallet, storage or value execution client', async () => {
  const runtime = `${await readFile(path.join(root, 'src/app.mjs'), 'utf8')}\n${await readFile(path.join(root, 'src/public-contract.mjs'), 'utf8')}`;
  assert.doesNotMatch(runtime, /\/api\//i);
  assert.doesNotMatch(runtime, /\bBearer\b|Authorization\s*:|localStorage|sessionStorage|document\.cookie/i);
  assert.doesNotMatch(runtime, /signTransaction|sendTransaction|sendRawTransaction/);
  assert.doesNotMatch(runtime, /createCheckout|checkoutSession|walletAdapter|@solana\/web3\.js/i);
  assert.match(runtime, /SECURITY \/ ANTI-SCAM/);
  assert.match(runtime, /Never share a seed phrase, private key, recovery phrase/);
  assert.match(runtime, /Do not send SOL, USDC or LUMA manually/);
  assert.match(runtime, /facts\.asset\.mint_address/);
});
