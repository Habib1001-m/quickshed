import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  PUBLIC_TOP_LEVEL_DIRECTORIES,
  findHistoryPathViolations,
  findPathViolation,
  findTrackedPathViolations,
} from '../scripts/check-public-boundary.mjs';

const repositoryRoot = join(import.meta.dirname, '..');
const guardScript = join(repositoryRoot, 'scripts/check-public-boundary.mjs');

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
  assert.equal(findPathViolation('src/lib/runtimeish.ts'), null);
});

test('rejects runtime path components in every position', () => {
  assert.match(findPathViolation('docs/runtime.md'), /runtime instruction/);
  assert.match(findPathViolation('docs/runtime-notes.md'), /runtime instruction/);
});

test('rejects environment-secret components wherever they occur', () => {
  assert.match(
    findPathViolation('docs/.env.production/secret.txt'),
    /environment-secret/,
  );
  assert.match(
    findPathViolation('docs/.env.example/notes.txt'),
    /environment-secret/,
  );
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

test('rejects golden evaluation trees inside public directories', () => {
  assert.match(
    findPathViolation('docs/golden-evaluation/case.json'),
    /benchmark or evaluation/,
  );
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

test('fails history scan when a blocked path was added and later deleted', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'quickshed-public-history-'));
  const blockedPath = '.agents/synthetic/fixture.txt';
  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  git(cwd, ['init', '-q']);
  git(cwd, ['config', 'user.name', 'Synthetic Fixture']);
  git(cwd, ['config', 'user.email', 'synthetic@example.invalid']);
  git(cwd, ['config', 'commit.gpgSign', 'false']);
  writeFileSync(join(cwd, '.gitignore'), '.agents/\n');
  writeFileSync(join(cwd, 'README.md'), 'synthetic fixture only\n');
  git(cwd, ['add', '.gitignore', 'README.md']);
  git(cwd, ['commit', '-qm', 'create clean base']);
  const baseCommit = git(cwd, ['rev-parse', 'HEAD']);
  git(cwd, ['checkout', '-qb', 'candidate']);

  mkdirSync(join(cwd, '.agents', 'synthetic'), { recursive: true });
  writeFileSync(join(cwd, blockedPath), 'synthetic fixture only\n');
  git(cwd, ['add', '-f', blockedPath]);
  git(cwd, ['commit', '-qm', 'add synthetic fixture']);
  const addCommit = git(cwd, ['rev-parse', 'HEAD']);

  git(cwd, ['rm', blockedPath]);
  git(cwd, ['commit', '-qm', 'delete synthetic fixture']);
  const deleteCommit = git(cwd, ['rev-parse', 'HEAD']);
  git(cwd, ['update-ref', 'refs/remotes/origin/main', baseCommit]);

  assert.deepEqual(findTrackedPathViolations(cwd), []);
  assert.deepEqual(findHistoryPathViolations(cwd, baseCommit), [
    `${addCommit}: ${blockedPath}: blocked agent or workspace path component ".agents"`,
    `${deleteCommit}: ${blockedPath}: blocked agent or workspace path component ".agents"`,
  ]);

  const guardRun = spawnSync(process.execPath, [guardScript], {
    cwd,
    encoding: 'utf8',
  });
  assert.equal(guardRun.status, 1);
  assert.match(guardRun.stderr, /CONTAMINATED_BRANCH=DO_NOT_FIX_BY_DELETE_ONLY/);
  assert.match(guardRun.stderr, /REBUILD_FROM_CLEAN_BASE/);
});

test('passes the current PR history range from origin/main', () => {
  const baseCommit = git(repositoryRoot, ['rev-parse', 'origin/main']);
  assert.deepEqual(findHistoryPathViolations(repositoryRoot, baseCommit), []);
});

test('fails closed when the history base cannot be resolved', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'quickshed-public-base-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  git(cwd, ['init', '-q']);
  git(cwd, ['config', 'user.name', 'Synthetic Fixture']);
  git(cwd, ['config', 'user.email', 'synthetic@example.invalid']);
  git(cwd, ['config', 'commit.gpgSign', 'false']);
  writeFileSync(join(cwd, 'README.md'), 'synthetic fixture only\n');
  git(cwd, ['add', 'README.md']);
  git(cwd, ['commit', '-qm', 'create isolated repository']);

  assert.throws(() => findHistoryPathViolations(cwd), /history base/i);

  const guardRun = spawnSync(process.execPath, [guardScript], {
    cwd,
    encoding: 'utf8',
  });
  assert.equal(guardRun.status, 1);
  assert.match(guardRun.stderr, /HISTORY_BASE_UNRESOLVED=FAIL_CLOSED/);
});
