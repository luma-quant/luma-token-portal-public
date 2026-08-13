import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { projectRoot } from './lib.mjs';
import { canonicalPublicManifest, createPublicManifest, PUBLIC_MANIFEST_PATH } from './public-manifest-lib.mjs';

const manifest = await createPublicManifest();
await writeFile(
  path.join(projectRoot, PUBLIC_MANIFEST_PATH),
  canonicalPublicManifest(manifest),
  { encoding: 'utf8', mode: 0o600 },
);
console.log(`Generated exact public source closure for ${manifest.entry_count} candidate files.`);
