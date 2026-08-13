import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { projectRoot } from './lib.mjs';
import { canonicalSbom, createSbom } from './sbom-lib.mjs';

await writeFile(
  path.join(projectRoot, 'SBOM.spdx.json'),
  canonicalSbom(await createSbom()),
  { encoding: 'utf8', mode: 0o600 },
);
console.log('Generated deterministic SPDX 2.3 SBOM.');
