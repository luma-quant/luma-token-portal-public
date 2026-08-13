import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { filesUnder, projectRoot, sha256 } from './lib.mjs';

const dist = path.join(projectRoot, 'dist');
const expected = new Set([
  'NOTICE.txt',
  'RELEASE.json',
  'SECURITY_HEADERS.json',
  'SHA256SUMS',
  'TOKEN_FACTS.json',
  'assets/app.mjs',
  'assets/public-contract.mjs',
  'assets/styles.css',
  'index.html',
  'logo-1.webp',
]);
const files = await filesUnder(dist);
const relatives = files.map((file) => path.relative(dist, file).split(path.sep).join('/'));
if (relatives.length !== expected.size || relatives.some((file) => !expected.has(file))) {
  throw new Error(`Distribution allowlist mismatch: ${relatives.join(', ')}`);
}

const checksumText = await readFile(path.join(dist, 'SHA256SUMS'), 'utf8');
const expectedLines = [];
for (const relative of relatives
  .filter((file) => file !== 'SHA256SUMS')
  .sort((left, right) => left.localeCompare(right, 'en'))) {
  expectedLines.push(`${sha256(await readFile(path.join(dist, relative)))}  ${relative}`);
}
if (checksumText !== `${expectedLines.join('\n')}\n`) throw new Error('Distribution checksums are stale.');

const executable = [
  await readFile(path.join(dist, 'index.html'), 'utf8'),
  await readFile(path.join(dist, 'assets/app.mjs'), 'utf8'),
  await readFile(path.join(dist, 'assets/public-contract.mjs'), 'utf8'),
].join('\n');
const forbidden = [
  /https?:\/\/(?!(?:www\.w3\.org|token\.lumaquant\.tech)(?=[/:'"\s]|$))/i,
  /\/api\//i,
  /\bBearer\b|Authorization\s*:/i,
  /localStorage|sessionStorage|document\.cookie/i,
  /navigator\.solana|window\.(?:phantom|solflare|backpack)|wallet-adapter/i,
  /signTransaction|sendTransaction|sendRawTransaction/,
  /createCheckout|checkoutSession|payment.{0,12}(?:create|submit|execute)/i,
  /mint.{0,12}(?:create|submit|execute)/i,
];
for (const pattern of forbidden) {
  if (pattern.test(executable)) throw new Error(`Distribution contains forbidden runtime marker: ${pattern}`);
}

const html = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const policy of ["default-src 'self'", "connect-src 'self'", "object-src 'none'", "form-action 'none'"]) {
  if (!html.includes(policy)) throw new Error(`Portable CSP is missing ${policy}.`);
}

console.log(`Verified ${files.length} distribution files, exact checksums and a non-operational runtime.`);
