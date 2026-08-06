#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildIdPath = path.join(projectRoot, '.next', 'BUILD_ID');
const playwrightConfigPath = path.join(projectRoot, 'playwright.config.ts');
const playwrightConfig = fs.readFileSync(playwrightConfigPath, 'utf8');
const baseUrlMatch = playwrightConfig.match(/baseURL:\s*['"]([^'"]+)['"]/);

if (!baseUrlMatch) {
  console.error('Build provenance check failed: Playwright baseURL is not declared.');
  process.exit(1);
}

const testOrigin = new URL(baseUrlMatch[1]);

if (!['localhost', '127.0.0.1'].includes(testOrigin.hostname)) {
  console.error('Build provenance check failed: the release test origin must be loopback-only.');
  process.exit(1);
}

if (!fs.existsSync(buildIdPath) || fs.statSync(buildIdPath).size === 0) {
  console.error('Build provenance check failed: .next/BUILD_ID is missing or empty.');
  process.exit(1);
}

console.log('Build provenance check passed: production build marker exists and release tests target loopback.');
