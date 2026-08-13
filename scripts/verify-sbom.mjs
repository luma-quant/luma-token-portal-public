import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { projectRoot } from './lib.mjs';
import { canonicalSbom, createSbom } from './sbom-lib.mjs';

const expected = canonicalSbom(await createSbom());
const actual = await readFile(path.join(projectRoot, 'SBOM.spdx.json'), 'utf8');
if (actual !== expected) throw new Error('SBOM is stale or does not match repository content.');
console.log('Verified deterministic SPDX 2.3 SBOM with zero package dependencies.');
