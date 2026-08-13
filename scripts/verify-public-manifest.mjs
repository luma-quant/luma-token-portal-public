import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { projectRoot, sha256 } from './lib.mjs';
import { canonicalPublicManifest, createPublicManifest, PUBLIC_MANIFEST_PATH } from './public-manifest-lib.mjs';

const expected = canonicalPublicManifest(await createPublicManifest());
const actual = await readFile(path.join(projectRoot, PUBLIC_MANIFEST_PATH), 'utf8');
if (actual !== expected) throw new Error('PUBLIC_SOURCE_MANIFEST.json is stale or is not the exact candidate closure.');
console.log(`Verified exact public source closure: ${sha256(Buffer.from(actual))}.`);
