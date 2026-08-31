import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  PUBLIC_TOP_LEVEL_DIRECTORIES,
  findPathViolation,
  findTrackedPathViolations,
} from '../scripts/check-public-boundary.mjs';

const repositoryRoot = join(import.meta.dirname, '..');

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

test('allows root files and every current public top-level directory', () => {
  assert.equal(findPathViolation('package.json'), null);

  for (const directory of PUBLIC_TOP_LEVEL_DIRECTORIES) {
    assert.equal(findPathViolation(`${directory}/placeholder.txt`), null);
  }
});

test('does not reject ordinary filenames containing similar English text', () => {
  assert.equal(findPathViolation('src/lib/internalization.ts'), null);
  assert.equal(findPathViolation('docs/skills-guide.md'), null);
  assert.equal(findPathViolation('src/components/goldfish.ts'), null);
  assert.equal(findPathViolation('docs/holdoutish.md'), null);
});

test('rejects generic private and operational path classes', () => {
  const blockedPaths = [
    '.agents/workspace/notes.md',
    'skills/runtime/notes.md',
    'runtime-instructions/notes.md',
    'unknown-public-dir/file.txt',
    'docs/evidence/receipt.md',
    'src/execution/run.json',
    'benchmark-suite/case.json',
    'holdout-v1/case.json',
    'gold-evaluation/case.json',
    'docs/private-ops/note.md',
    'src/internal-ops/state.json',
    '.env.local',
    'config/release.zip',
  ];

  for (const path of blockedPaths) {
    assert.match(findPathViolation(path), /blocked|unsafe|unknown/i, path);
  }
});

test('allows only the intentional environment example', () => {
  assert.equal(findPathViolation('.env.example'), null);
  assert.notEqual(findPathViolation('.env.production'), null);
});

test('rejects a blocked ignored path after git add -f', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'quickshed-public-boundary-'));
  const blockedPath = '.agents/ignored/fixture.txt';
  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  mkdirSync(join(cwd, '.agents', 'ignored'), { recursive: true });
  writeFileSync(join(cwd, '.gitignore'), '.agents/\n');
  writeFileSync(join(cwd, blockedPath), 'synthetic fixture only\n');
  git(cwd, ['init', '-q']);
  git(cwd, ['add', '-f', blockedPath]);

  assert.equal(git(cwd, ['check-ignore', '--no-index', blockedPath]), blockedPath);
  assert.equal(git(cwd, ['ls-files']), blockedPath);
  assert.deepEqual(findTrackedPathViolations(cwd), [
    `${blockedPath}: blocked agent or workspace path component ".agents"`,
  ]);
});

test('passes the current clean repository scan', () => {
  assert.deepEqual(findTrackedPathViolations(repositoryRoot), []);
});
