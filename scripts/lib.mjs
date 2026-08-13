import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function json(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'));
}

export async function filesUnder(directory, options = {}) {
  const root = path.resolve(directory);
  const excludedDirectories = new Set(options.excludedDirectories ?? []);
  const output = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name, 'en'));
    for (const entry of entries) {
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile()) output.push(absolute);
      else throw new Error(`Unsupported filesystem entry: ${absolute}`);
    }
  }

  await walk(root);
  return output;
}

export function relativeUnix(absolutePath) {
  return path.relative(projectRoot, absolutePath).split(path.sep).join('/');
}

export function assertInside(root, candidate, label) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  if (resolvedCandidate === resolvedRoot || !resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`${label} escapes its expected root.`);
  }
  return resolvedCandidate;
}

export async function canonicalTreeDigest(excluded = new Set()) {
  const files = await filesUnder(projectRoot, { excludedDirectories: new Set(['.git', 'dist', 'node_modules']) });
  const rows = [];
  for (const absolute of files) {
    const relative = relativeUnix(absolute);
    if (excluded.has(relative)) continue;
    rows.push(`${sha256(await readFile(absolute))}  ${relative}`);
  }
  return sha256(Buffer.from(`${rows.join('\n')}\n`, 'utf8'));
}
