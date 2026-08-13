import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync } from 'node:zlib';

import { filesUnder, projectRoot, relativeUnix } from './lib.mjs';

const outputArgument = process.argv[2];
if (!outputArgument) throw new Error('Provide an archive output path outside the candidate.');
const output = path.resolve(outputArgument);
if (path.extname(output).toLowerCase() !== '.zip') throw new Error('Archive output must end in .zip.');
if (output === projectRoot || output.startsWith(`${projectRoot}${path.sep}`)) throw new Error('Archive must be outside the candidate.');

const files = await filesUnder(projectRoot, { excludedDirectories: new Set(['.git', 'dist', 'node_modules']) });
const entries = await Promise.all(files.map(async (absolute) => ({
  name: relativeUnix(absolute),
  bytes: await readFile(absolute),
})));
entries.sort((left, right) => left.name.localeCompare(right.name, 'en'));

const u16 = (value) => { const b = Buffer.alloc(2); b.writeUInt16LE(value); return b; };
const u32 = (value) => { const b = Buffer.alloc(4); b.writeUInt32LE(value >>> 0); return b; };
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});
const crc32 = (bytes) => {
  let value = 0xffffffff;
  for (const byte of bytes) value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
  return (value ^ 0xffffffff) >>> 0;
};

const localParts = [];
const centralParts = [];
let offset = 0;
for (const entry of entries) {
  const name = Buffer.from(entry.name, 'utf8');
  const compressed = deflateRawSync(entry.bytes, { level: 9 });
  const crc = crc32(entry.bytes);
  const local = Buffer.concat([
    u32(0x04034b50), u16(20), u16(0x0800), u16(8), u16(0), u16(0),
    u32(crc), u32(compressed.length), u32(entry.bytes.length), u16(name.length), u16(0), name,
  ]);
  localParts.push(local, compressed);
  centralParts.push(Buffer.concat([
    u32(0x02014b50), u16(0x0314), u16(20), u16(0x0800), u16(8), u16(0), u16(0),
    u32(crc), u32(compressed.length), u32(entry.bytes.length), u16(name.length), u16(0),
    u16(0), u16(0), u16(0), u32(0o100644 << 16), u32(offset), name,
  ]));
  offset += local.length + compressed.length;
}
const central = Buffer.concat(centralParts);
const end = Buffer.concat([
  u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
  u32(central.length), u32(offset), u16(0),
]);
const archive = Buffer.concat([...localParts, central, end]);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, archive, { mode: 0o600 });
const digest = createHash('sha256').update(archive).digest('hex');
await writeFile(`${output}.sha256`, `${digest}  ${path.basename(output)}\n`, { encoding: 'ascii', mode: 0o600 });
console.log(JSON.stringify({ archive_file_count: entries.length, archive_sha256: digest, output }));
