import { execFile } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { assertInside, json, projectRoot, sha256 } from './lib.mjs';

const exec = promisify(execFile);

const sourceFlag = process.argv.indexOf('--source-root');
const rawSourceRoot = sourceFlag >= 0 ? process.argv[sourceFlag + 1] : null;
if (!rawSourceRoot) throw new Error('Use --source-root with the reviewed private source checkout.');
const sourceRoot = path.resolve(rawSourceRoot);
if (sourceRoot === projectRoot || projectRoot.startsWith(`${sourceRoot}${path.sep}`)) {
  throw new Error('Source root must be a separate private checkout.');
}

const allowlist = await json('ALLOWLIST.json');
const manifest = await json('UPSTREAM_SOURCE_EVIDENCE.json');
if (allowlist.policy !== 'deny-by-default') throw new Error('Allowlist must remain deny-by-default.');
if (allowlist.source_commit !== manifest.source_private_commit_sha) throw new Error('Allowlist and evidence commit differ.');

const { stdout: rawTopLevel } = await exec('git', ['-C', sourceRoot, 'rev-parse', '--show-toplevel']);
if (path.resolve(rawTopLevel.trim()) !== sourceRoot) throw new Error('Source root must be the exact Git worktree root.');
const { stdout: rawHead } = await exec('git', ['-C', sourceRoot, 'rev-parse', 'HEAD']);
const head = rawHead.trim();
if (head !== manifest.source_private_commit_sha) {
  throw new Error(`Source HEAD ${head} does not match reviewed commit ${manifest.source_private_commit_sha}.`);
}

for (const allowed of allowlist.entries) {
  const expected = manifest.entries.find((entry) => (
    entry.source_path === allowed.source
    && entry.candidate_path === allowed.target
    && entry.copy_mode === allowed.mode
  ));
  if (!expected) throw new Error(`Allowlist entry lacks a reviewed manifest record: ${allowed.source}`);
  if (path.isAbsolute(allowed.source) || allowed.source.includes('\\') || allowed.source.split('/').includes('..')) {
    throw new Error(`Unsafe Git source path: ${allowed.source}`);
  }
  const target = assertInside(projectRoot, path.join(projectRoot, allowed.target), 'Candidate target');
  const { stdout: bytes } = await exec(
    'git',
    ['-C', sourceRoot, 'show', `${head}:${allowed.source}`],
    { encoding: 'buffer', maxBuffer: 16 * 1024 * 1024 },
  );
  if (bytes.length !== expected.bytes || sha256(bytes) !== expected.sha256) {
    throw new Error(`Upstream drift requires a new review and manifest: ${allowed.source}`);
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes, { mode: 0o600 });
}

console.log(`Refreshed exactly ${allowlist.entries.length} reviewed blobs from source Git HEAD ${head}; no worktree file was copied.`);
