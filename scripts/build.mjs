import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { assertInside, filesUnder, json, projectRoot, relativeUnix, sha256 } from './lib.mjs';

const packageJson = await json('package.json');
if (packageJson.name !== 'luma-token-portal-trust-reference' || packageJson.private !== true) {
  throw new Error('Refusing to build outside the local private candidate contract.');
}

const dist = assertInside(projectRoot, path.join(projectRoot, 'dist'), 'Distribution directory');
await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });

const copies = [
  ['index.html', 'index.html'],
  ['src/app.mjs', 'assets/app.mjs'],
  ['src/public-contract.mjs', 'assets/public-contract.mjs'],
  ['src/styles.css', 'assets/styles.css'],
  ['public/logo-1.webp', 'logo-1.webp'],
  ['TOKEN_FACTS.json', 'TOKEN_FACTS.json'],
  ['RELEASE.json', 'RELEASE.json'],
  ['NOTICE.md', 'NOTICE.txt'],
  ['SECURITY_HEADERS.json', 'SECURITY_HEADERS.json'],
];

for (const [sourceRelative, targetRelative] of copies) {
  const source = assertInside(projectRoot, path.join(projectRoot, sourceRelative), 'Build source');
  const target = assertInside(dist, path.join(dist, targetRelative), 'Build target');
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
}

const builtFiles = await filesUnder(dist);
const sums = [];
for (const absolute of builtFiles) {
  const relative = path.relative(dist, absolute).split(path.sep).join('/');
  if (relative.endsWith('.map')) throw new Error('Source maps are forbidden.');
  sums.push(`${sha256(await readFile(absolute))}  ${relative}`);
}
sums.sort((left, right) => left.slice(66).localeCompare(right.slice(66), 'en'));
await writeFile(path.join(dist, 'SHA256SUMS'), `${sums.join('\n')}\n`, { encoding: 'utf8', mode: 0o600 });

console.log(`Built ${builtFiles.length + 1} exact distribution files.`);
