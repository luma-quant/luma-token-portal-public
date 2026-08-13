import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { canonicalTreeDigest, json, projectRoot, sha256 } from './lib.mjs';

const release = await json('RELEASE.json');
const facts = await json('TOKEN_FACTS.json');
const upstream = await json('UPSTREAM_SOURCE_EVIDENCE.json');
const assetInventory = await readFile(path.join(projectRoot, 'ASSET_RIGHTS_INVENTORY.json'));
const expectedCandidate = await canonicalTreeDigest(new Set([
  'PUBLIC_SOURCE_MANIFEST.json',
  'RELEASE.json',
]));
if (release.candidate_sha256 !== expectedCandidate) throw new Error('RELEASE candidate SHA-256 is stale.');
if (release.public_candidate_sha256 !== expectedCandidate) throw new Error('Canonical RELEASE candidate SHA-256 is stale.');
if (release.public_release !== release.version.replace(/^v/, '')) throw new Error('Canonical public release alias differs.');
if (release.exported_at_utc !== release.exported_at) throw new Error('Canonical export time alias differs.');
if (release.live_domain !== 'https://token.lumaquant.tech' || release.deployment_status !== 'NOT_DEPLOYED') {
  throw new Error('Associated domain and candidate deployment status must remain distinct.');
}
if (release.source_private_commit_sha !== upstream.source_private_commit_sha) {
  throw new Error('RELEASE and upstream evidence source commits differ.');
}
if (release.production_alignment !== facts.assurance_status.production_alignment) {
  throw new Error('Production-alignment status differs between RELEASE and TOKEN_FACTS.');
}
if (release.independent_audit !== facts.assurance_status.independent_audit) {
  throw new Error('Independent-audit status differs between RELEASE and TOKEN_FACTS.');
}
if (release.legal_review !== facts.assurance_status.legal_review) {
  throw new Error('Legal-review status differs between RELEASE and TOKEN_FACTS.');
}
if (release.license_status !== 'PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED') {
  throw new Error('Owner-approved proprietary source-available license status is missing.');
}
if (release.rights_status !== 'PROPRIETARY_SOURCE_AVAILABLE_ALL_RIGHTS_RESERVED') {
  throw new Error('Owner-approved rights status is missing.');
}
if (release.asset_rights_inventory_sha256 !== sha256(assetInventory)) {
  throw new Error('Asset-rights inventory digest is stale.');
}
if (release.repository_creation_status !== 'PENDING' || release.publication_performed !== false) {
  throw new Error('Pending repository creation must not be reported as publication.');
}
if (release.real_payments_status !== 'REAL_PAYMENTS_DISABLED' || release.token_delivery_status !== 'TOKEN_DELIVERY_DISABLED') {
  throw new Error('Operational value boundaries are not explicitly disabled.');
}
for (const [pathField, hashField] of [
  ['request_path', 'request_sha256'],
  ['response_path', 'response_sha256'],
]) {
  const bytes = await readFile(path.join(projectRoot, facts.raw_rpc_evidence[pathField]));
  if (sha256(bytes) !== facts.raw_rpc_evidence[hashField]) throw new Error(`Raw RPC evidence drifted: ${pathField}`);
}
console.log(`Verified release, candidate digest, status alignment and raw RPC evidence: ${expectedCandidate}.`);
