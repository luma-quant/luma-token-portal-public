import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { json, projectRoot, sha256 } from './lib.mjs';

const manifest = await json('UPSTREAM_SOURCE_EVIDENCE.json');
const allowlist = await json('ALLOWLIST.json');
if (manifest.schema !== 'luma-upstream-source-evidence-v1') throw new Error('Upstream evidence schema is invalid.');
if (allowlist.schema !== 'luma-public-source-allowlist-v1' || allowlist.policy !== 'deny-by-default') {
  throw new Error('Source allowlist policy is invalid.');
}
if (manifest.source_private_commit_sha !== allowlist.source_commit) throw new Error('Source commit mismatch.');
if (!/^[0-9a-f]{40}$/.test(manifest.source_private_commit_sha)) throw new Error('Source commit is invalid.');
if (manifest.entries.length !== allowlist.entries.length) throw new Error('Allowlist and manifest lengths differ.');

for (const entry of manifest.entries) {
  const allowed = allowlist.entries.find((item) => item.source === entry.source_path);
  if (!allowed || allowed.target !== entry.candidate_path || allowed.mode !== entry.copy_mode) {
    throw new Error(`Manifest entry is not allowlisted: ${entry.source_path}`);
  }
  const candidatePath = path.join(projectRoot, entry.candidate_path);
  const bytes = await readFile(candidatePath);
  const info = await stat(candidatePath);
  if (info.size !== entry.bytes || sha256(bytes) !== entry.sha256) {
    throw new Error(`Verbatim source evidence drifted: ${entry.candidate_path}`);
  }
}

console.log(`Verified ${manifest.entries.length} allowlisted source artifacts at ${manifest.source_private_commit_sha}.`);
