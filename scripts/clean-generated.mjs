import { rm } from 'node:fs/promises';
import path from 'node:path';

import { assertInside, projectRoot } from './lib.mjs';

const dist = assertInside(projectRoot, path.join(projectRoot, 'dist'), 'Distribution directory');
await rm(dist, { recursive: true, force: true });
console.log('Removed generated distribution directory.');
