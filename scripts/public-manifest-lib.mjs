import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { filesUnder, json, projectRoot, relativeUnix, sha256 } from './lib.mjs';

export const PUBLIC_MANIFEST_PATH = 'PUBLIC_SOURCE_MANIFEST.json';

export async function createPublicManifest() {
  const release = await json('RELEASE.json');
  const files = await filesUnder(projectRoot, { excludedDirectories: new Set(['.git']) });
  const entries = [];

  for (const absolute of files) {
    const relative = relativeUnix(absolute);
    if (relative === PUBLIC_MANIFEST_PATH) continue;
    if (relative.startsWith('dist/') || relative.startsWith('node_modules/')) {
      throw new Error(`Generated or installed content is present in the source candidate: ${relative}. Run npm run clean first.`);
    }
    const bytes = await readFile(absolute);
    const info = await stat(absolute);
    entries.push({ path: relative, bytes: info.size, sha256: sha256(bytes) });
  }

  entries.sort((left, right) => left.path.localeCompare(right.path, 'en'));
  return {
    schema: 'luma-public-source-manifest-v2',
    version: release.version,
    public_release: release.public_release,
    generated_at: release.exported_at,
    exported_at_utc: release.exported_at_utc,
    candidate_sha256: release.candidate_sha256,
    public_candidate_sha256: release.public_candidate_sha256,
    source_private_commit_sha: release.source_private_commit_sha,
    export_tool_version: '2.1.0',
    release_class: release.release_class,
    repository: release.repository,
    repository_url: release.repository_url,
    repository_creation_status: release.repository_creation_status,
    repository_visibility: release.repository_visibility,
    repository_status: release.repository_status,
    publication_status: release.publication_status,
    publication_performed: release.publication_performed,
    publication_evidence_file: release.publication_evidence_file,
    publication_evidence_sha256: release.publication_evidence_sha256,
    separate_engine_e4_milestone: release.separate_engine_e4_milestone,
    owner_gate_status: {
      operator_identity: release.operator_identity_status,
      license: release.license_status,
      asset_rights: release.asset_rights_status,
      asset_rights_inventory_sha256: release.asset_rights_inventory_sha256,
      security_contact: release.security_contact_status,
      open_review_matters: release.open_review_matters,
    },
    excluded_category_summary: [
      'complete private frontend outside the three-file source allowlist',
      'wallet, payment, fulfillment, key redemption, NFT minting and transaction signing',
      'backend, database, admin, deployment, secrets, logs and customer data',
      'generated dist, installed dependencies and Git repository metadata',
    ],
    closure_scope: 'Every file in the clean candidate source tree, excluding only this manifest and Git repository metadata.',
    entry_count: entries.length,
    entries,
  };
}

export function canonicalPublicManifest(manifest) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
