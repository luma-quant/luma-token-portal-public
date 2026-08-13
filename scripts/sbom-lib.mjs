import { readFile } from 'node:fs/promises';

import { filesUnder, json, projectRoot, relativeUnix, sha256 } from './lib.mjs';

export async function createSbom() {
  const release = await json('RELEASE.json');
  const files = await filesUnder(projectRoot, { excludedDirectories: new Set(['.git', 'dist', 'node_modules']) });
  const records = [];
  for (const absolute of files) {
    const relative = relativeUnix(absolute);
    if (new Set(['PUBLIC_SOURCE_MANIFEST.json', 'RELEASE.json', 'SBOM.spdx.json']).has(relative)) continue;
    records.push({
      SPDXID: `SPDXRef-File-${sha256(Buffer.from(relative)).slice(0, 16)}`,
      fileName: `./${relative}`,
      checksums: [{ algorithm: 'SHA256', checksumValue: sha256(await readFile(absolute)) }],
    });
  }
  records.sort((left, right) => left.fileName.localeCompare(right.fileName, 'en'));
  return {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: `luma-token-portal-trust-reference-${release.version}`,
    documentNamespace: `https://lumaquant.tech/sbom/luma-token-portal/${release.version}/reference`,
    documentComment: 'PUBLIC_SOURCE_MANIFEST.json, RELEASE.json and this SBOM are excluded from SPDX file records to prevent self-referential hash cycles. PUBLIC_SOURCE_MANIFEST.json separately closes over every candidate file except itself.',
    creationInfo: {
      created: release.exported_at_utc,
      creators: ['Organization: Luma Quant e.U.', 'Tool: dependency-free-luma-sbom-generator-v1'],
      licenseListVersion: '3.25',
    },
    packages: [{
      name: 'luma-token-portal-trust-reference',
      SPDXID: 'SPDXRef-Package',
      versionInfo: release.version,
      downloadLocation: 'NOASSERTION',
      filesAnalyzed: true,
      licenseConcluded: 'LicenseRef-LumaQuant-Proprietary',
      licenseDeclared: 'LicenseRef-LumaQuant-Proprietary',
      copyrightText: 'Copyright 2026 Luma Quant e.U. All rights reserved.',
      externalRefs: [{
        referenceCategory: 'PACKAGE-MANAGER',
        referenceType: 'purl',
        referenceLocator: `pkg:npm/luma-token-portal-trust-reference@${release.version.replace(/^v/, '')}`,
      }],
    }],
    files: records,
    relationships: [
      { spdxElementId: 'SPDXRef-DOCUMENT', relationshipType: 'DESCRIBES', relatedSpdxElement: 'SPDXRef-Package' },
      ...records.map((file) => ({
        spdxElementId: 'SPDXRef-Package',
        relationshipType: 'CONTAINS',
        relatedSpdxElement: file.SPDXID,
      })),
    ],
  };
}

export function canonicalSbom(sbom) {
  return `${JSON.stringify(sbom, null, 2)}\n`;
}
