import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatToolCountIssues, reconcileToolCount } from './check-tool-count.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const fixtureRoot = path.join(projectRoot, 'tests', 'fixtures', 'tool-count');

const cases = [
  {
    id: 'positive-reconciliation',
    root: path.join(fixtureRoot, 'positive'),
    expectedSourceCount: 2,
    shouldPass: true,
  },
  {
    id: 'source-index-count-drift',
    root: path.join(fixtureRoot, 'negative-count'),
    expectedSourceCount: 2,
    shouldPass: false,
    expectedCodes: ['source-count-drift', 'index-count-mismatch'],
  },
  {
    id: 'stale-product-claim',
    root: path.join(fixtureRoot, 'negative-claim'),
    expectedSourceCount: 2,
    shouldPass: false,
    expectedCodes: ['stale-91-tool-claim'],
    expectedPaths: ['CONTRIBUTING.md'],
  },
];

const failures = [];
for (const fixtureCase of cases) {
  const result = reconcileToolCount(fixtureCase.root, {
    expectedSourceCount: fixtureCase.expectedSourceCount,
  });
  if (result.success !== fixtureCase.shouldPass) {
    failures.push(
      `${fixtureCase.id} expected ${fixtureCase.shouldPass ? 'pass' : 'failure'} but received ${
        result.success ? 'pass' : 'failure'
      }`,
    );
    continue;
  }

  const actualCodes = new Set(result.issues.map((issue) => issue.code));
  for (const expectedCode of fixtureCase.expectedCodes ?? []) {
    if (!actualCodes.has(expectedCode)) {
      failures.push(
        `${fixtureCase.id} did not produce ${expectedCode}; received ${formatToolCountIssues(result.issues)}`,
      );
    }
  }

  const actualPaths = new Set(result.issues.map((issue) => issue.path));
  for (const expectedPath of fixtureCase.expectedPaths ?? []) {
    if (!actualPaths.has(expectedPath)) {
      failures.push(
        `${fixtureCase.id} did not scan ${expectedPath}; received ${formatToolCountIssues(result.issues)}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${cases.length} tool-count reconciliation fixtures; pass and fail paths are covered.`);
}
