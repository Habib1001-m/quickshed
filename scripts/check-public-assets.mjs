#!/usr/bin/env node

import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();
const publicDir = join(root, 'public');

const blockedNames = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.env.development',
]);

const blockedDirs = new Set([
  'skills',
  'upload',
  'agent-ctx',
  '.claude',
  '.hermes',
]);

const blockedExtensions = [
  '.zip',
  '.tar',
  '.tgz',
  '.tar.gz',
  '.7z',
  '.rar',
];

function isBlockedArchive(path) {
  return blockedExtensions.some((ext) => path.endsWith(ext));
}

function scan(dir, findings = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    const relPath = relative(root, fullPath).split(sep).join('/');
    const lowerName = entry.name.toLowerCase();
    const lowerRel = relPath.toLowerCase();

    if (blockedNames.has(lowerName)) {
      findings.push(`${relPath} matches a blocked environment filename`);
    }

    if (entry.isDirectory()) {
      if (blockedDirs.has(lowerName)) {
        findings.push(`${relPath}/ matches a blocked internal directory`);
      }
      scan(fullPath, findings);
      continue;
    }

    if (entry.isFile()) {
      const stat = statSync(fullPath);
      if (isBlockedArchive(lowerRel)) {
        findings.push(`${relPath} is an archive and must not be served from public/`);
      }
      if (stat.size > 5 * 1024 * 1024) {
        findings.push(`${relPath} is larger than 5 MiB; large release artifacts belong outside public/`);
      }
    }
  }
  return findings;
}

const findings = scan(publicDir);

if (findings.length > 0) {
  console.error('Public asset guard failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Public asset guard passed.');
