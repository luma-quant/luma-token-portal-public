import { canonicalTreeDigest } from './lib.mjs';

const digest = await canonicalTreeDigest(new Set([
  'PUBLIC_SOURCE_MANIFEST.json',
  'RELEASE.json',
]));
console.log(digest);
