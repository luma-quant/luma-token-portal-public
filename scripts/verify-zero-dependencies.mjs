import { json } from './lib.mjs';

const packageJson = await json('package.json');
const lock = await json('package-lock.json');
for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  const values = packageJson[field] ?? {};
  if (Object.keys(values).length !== 0) throw new Error(`package.json ${field} must remain empty.`);
}
if (lock.lockfileVersion !== 3 || lock.requires !== true) throw new Error('package-lock.json metadata is invalid.');
const packageEntries = Object.keys(lock.packages ?? {});
if (packageEntries.length !== 1 || packageEntries[0] !== '') {
  throw new Error('Lockfile contains package dependencies.');
}
if (lock.packages[''].name !== packageJson.name || lock.packages[''].version !== packageJson.version) {
  throw new Error('Lockfile root package does not match package.json.');
}
console.log('Verified package and lockfile contain zero dependencies.');
