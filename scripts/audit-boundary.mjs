import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { filesUnder, json, projectRoot, relativeUnix, sha256 } from './lib.mjs';

const deny = await json('DENYLIST.json');
if (deny.schema !== 'luma-public-source-denylist-v1') throw new Error('Denylist schema is invalid.');

const manifest = await json('UPSTREAM_SOURCE_EVIDENCE.json');
const expectedEvidence = new Set(
  manifest.entries
    .map((entry) => entry.candidate_path)
    .filter((candidatePath) => candidatePath.startsWith('evidence/')),
);
const evidenceFiles = (await filesUnder(path.join(projectRoot, 'evidence', 'upstream'))).map(relativeUnix);
if (
  evidenceFiles.length !== expectedEvidence.size
  || evidenceFiles.some((file) => !expectedEvidence.has(file))
) throw new Error('Evidence directory contains a file outside the manifest.');

const facts = await json('TOKEN_FACTS.json');
const expectedOnchainEvidence = new Set([
  facts.raw_rpc_evidence.request_path,
  facts.raw_rpc_evidence.response_path,
]);
const onchainEvidenceFiles = (await filesUnder(path.join(projectRoot, 'evidence', 'onchain'))).map(relativeUnix);
if (
  onchainEvidenceFiles.length !== expectedOnchainEvidence.size
  || onchainEvidenceFiles.some((file) => !expectedOnchainEvidence.has(file))
) throw new Error('On-chain evidence directory contains an unbound file.');

const forbiddenPathParts = [
  '.env', '.pem', '.p12', '.pfx', '.keystore', '.jks', '.sqlite', '.dump',
  '.log', '.map', 'node_modules', '__pycache__',
];

const assembled = (...parts) => new RegExp(parts.join(''), 'i');
const forbiddenSensitiveContent = [
  assembled('-----BEGIN ', '(?:RSA |EC |OPENSSH )?', 'PRIVATE KEY-----'),
  assembled('AKIA', '[A-Z0-9]{16}'),
  assembled('AIza', '[A-Za-z0-9_-]{35}'),
  assembled('(?:password|passwd|client_secret|jwt_secret)', '\\s*[:=]\\s*["\\\']?[^\\s"\\\']{8,}'),
  assembled('/api/v1/', '(?:admin|internal)(?:/|["\\\'])'),
  assembled('/api/v1/token-portal/', '(?:sale|value-rail)'),
  assembled('source', 'MappingURL'),
  assembled('[A-Za-z]:\\\\', '(?:backend|frontend|Users)\\\\'),
];
const forbiddenExecutionContent = [
  assembled('sign', 'Transaction'),
  assembled('send', 'Transaction'),
  assembled('sendRaw', 'Transaction'),
  assembled('secret', 'Key'),
  assembled('private', 'Key'),
];

const textExtensions = new Set(['.cjs', '.css', '.html', '.js', '.json', '.md', '.mjs', '.ts', '.txt', '.yml', '.yaml', '']);
const files = await filesUnder(projectRoot, { excludedDirectories: new Set(['.git', 'dist', 'node_modules']) });
for (const absolute of files) {
  const relative = relativeUnix(absolute);
  const lower = relative.toLowerCase();
  if (forbiddenPathParts.some((part) => lower.includes(part.toLowerCase()))) {
    throw new Error(`Forbidden file class: ${relative}`);
  }
  if (!textExtensions.has(path.extname(relative).toLowerCase())) continue;
  const content = await readFile(absolute, 'utf8');
  for (const pattern of forbiddenSensitiveContent) {
    if (pattern.test(content)) throw new Error(`Forbidden content ${pattern} in ${relative}`);
  }
  const containsNegativeSecurityAssertions = new Set([
    'evidence/upstream/src/api/tokenPortalForge.test.ts',
    'scripts/audit-boundary.mjs',
    'scripts/verify-dist.mjs',
    'test/public-contract.test.mjs',
  ]).has(relative);
  if (!containsNegativeSecurityAssertions) {
    for (const pattern of forbiddenExecutionContent) {
      if (pattern.test(content)) throw new Error(`Forbidden execution marker ${pattern} in ${relative}`);
    }
  }
}

const runtimeFiles = [
  'index.html',
  'src/app.mjs',
  'src/public-contract.mjs',
  'src/styles.css',
  'TOKEN_FACTS.json',
  'RELEASE.json',
  'SECURITY_HEADERS.json',
];
const runtimeText = (await Promise.all(runtimeFiles.map((file) => readFile(path.join(projectRoot, file), 'utf8')))).join('\n');
for (const forbidden of [
  'Authorization',
  'localStorage',
  'sessionStorage',
  'WebSocket',
  'XMLHttpRequest',
  'wallet-adapter',
  '/api/',
]) {
  if (runtimeText.includes(forbidden)) throw new Error(`Runtime contains forbidden capability marker: ${forbidden}`);
}

const sourceManifestBytes = await readFile(path.join(projectRoot, 'PUBLIC_SOURCE_MANIFEST.json'));
console.log(`Boundary audit passed: ${files.length} files; public closure ${sha256(sourceManifestBytes)}.`);
