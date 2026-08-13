import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { projectRoot } from './lib.mjs';

const workflow = await readFile(path.join(projectRoot, '.github/workflows/ci.yml'), 'utf8');
const actionUses = [...workflow.matchAll(/^\s*-?\s*uses:\s*([^\s#]+).*$/gm)].map((match) => match[1]);
if (actionUses.length !== 5) throw new Error('Expected two checkout, setup-node and two CodeQL actions.');
for (const action of actionUses) {
  const separator = action.lastIndexOf('@');
  if (separator < 1 || !/^[0-9a-f]{40}$/.test(action.slice(separator + 1))) {
    throw new Error(`GitHub Action is not pinned to a full commit SHA: ${action}`);
  }
}
for (const action of ['init', 'analyze']) {
  if (!workflow.includes(`github/codeql-action/${action}@7211b7c8077ea37d8641b6271f6a365a22a5fbfa`)) {
    throw new Error(`Pinned CodeQL ${action} action is missing.`);
  }
}
for (const required of [
  'permissions:\n  contents: read',
  "GITLEAKS_VERSION: '8.30.1'",
  "GITLEAKS_ARCHIVE_SHA256: '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb'",
  'gitleaks" git . --redact --verbose',
  "if: github.event.repository.visibility == 'public'",
  'security-events: write',
  'upload: always',
  'upload-database: true',
  'npm audit --omit=dev --audit-level=low',
]) {
  if (!workflow.includes(required)) throw new Error(`CI safety control is missing: ${required}`);
}
if (/permissions:[\s\S]{0,200}\bwrite-all\b/.test(workflow)) {
  throw new Error('CI requests broad write permission.');
}
if ((workflow.match(/security-events:\s*write/g) ?? []).length !== 1) {
  throw new Error('Only the public-only CodeQL job may request security-events write.');
}
if (workflow.includes('secrets.') || workflow.includes('gitleaks/gitleaks-action@')) {
  throw new Error('CI must not rely on repository secrets or the pull-request API Gitleaks action.');
}
console.log(`Verified ${actionUses.length} full-SHA action references and least-privilege CI permissions.`);
