import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(scriptDirectory, '..');
const EXPECTED_SOURCE_COUNT = 90;

// Keep this boundary focused on tracked product/communication text. In
// particular, do not broaden it to a whole-tree scan: tests and fixtures,
// local .codex evidence, .remember state, .next output, node_modules, .git,
// and specs may contain historical or explanatory "91" references. The
// specification/evidence allowance for explaining that the index is not a
// tool is preserved by leaving those paths outside this product claim scan.
const CLAIM_SCAN_ROOTS = [
  'README.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'AGENTS.md',
  'messages',
  'content',
  'docs',
  'public',
  'src',
  '.github',
  'quickshed-dev-workflow',
  'competitive_analysis',
];
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mdx',
  '.mjs',
  '.svg',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);
const STALE_TOOL_CLAIM_PATTERN = /\b91\s*[-–—]?\s*tools?\b/i;

function relativePath(projectRoot, absolutePath) {
  return path.relative(projectRoot, absolutePath).split(path.sep).join('/');
}

function collectTextFiles(projectRoot, rootName) {
  const absoluteRoot = path.join(projectRoot, rootName);
  if (!fs.existsSync(absoluteRoot)) return [];

  const stats = fs.statSync(absoluteRoot);
  if (stats.isFile()) {
    return TEXT_EXTENSIONS.has(path.extname(absoluteRoot).toLowerCase()) ? [absoluteRoot] : [];
  }

  const files = [];
  const entries = fs
    .readdirSync(absoluteRoot, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const entryPath = path.join(absoluteRoot, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTextFiles(projectRoot, relativePath(projectRoot, entryPath)));
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }
  return files;
}

export function findStaleToolClaims(projectRoot = PROJECT_ROOT) {
  const violations = [];
  const files = CLAIM_SCAN_ROOTS.flatMap((rootName) => collectTextFiles(projectRoot, rootName)).sort();

  for (const filePath of files) {
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (STALE_TOOL_CLAIM_PATTERN.test(line)) {
        violations.push({
          path: relativePath(projectRoot, filePath),
          line: index + 1,
          code: 'stale-91-tool-claim',
        });
      }
    });
  }

  return violations;
}

export function reconcileToolCount(
  projectRoot = PROJECT_ROOT,
  { expectedSourceCount = EXPECTED_SOURCE_COUNT } = {},
) {
  const sourceDirectory = path.join(projectRoot, 'content', 'tools');
  const indexPath = path.join(projectRoot, 'content', 'tools-index.json');
  const issues = [];

  let sourceCount = null;
  if (fs.existsSync(sourceDirectory) && fs.statSync(sourceDirectory).isDirectory()) {
    sourceCount = fs
      .readdirSync(sourceDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json')).length;
  } else {
    issues.push({ code: 'source-directory-missing', path: 'content/tools' });
  }

  let indexCount = null;
  try {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    if (Array.isArray(index)) {
      indexCount = index.length;
    } else {
      issues.push({ code: 'invalid-index-shape', path: 'content/tools-index.json' });
    }
  } catch {
    issues.push({ code: 'invalid-index-json', path: 'content/tools-index.json' });
  }

  if (sourceCount !== null && sourceCount !== expectedSourceCount) {
    issues.push({
      code: 'source-count-drift',
      path: 'content/tools',
      detail: `expected ${expectedSourceCount}, found ${sourceCount}`,
    });
  }
  if (sourceCount !== null && indexCount !== null && sourceCount !== indexCount) {
    issues.push({
      code: 'index-count-mismatch',
      path: 'content/tools-index.json',
      detail: `source ${sourceCount}, index ${indexCount}`,
    });
  }

  issues.push(...findStaleToolClaims(projectRoot));

  return {
    success: issues.length === 0,
    sourceCount,
    indexCount,
    issues,
  };
}

export function formatToolCountIssues(issues) {
  return issues
    .map((issue) => `[${issue.code}] ${issue.path}${issue.line ? `:${issue.line}` : ''}${issue.detail ? `: ${issue.detail}` : ''}`)
    .join('\n');
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const result = reconcileToolCount();
  if (!result.success) {
    console.error(formatToolCountIssues(result.issues));
    process.exitCode = 1;
  } else {
    console.log(
      `Reconciled ${result.sourceCount} source tool definitions with ${result.indexCount} index entries; no stale 91-tool product or communication claims found.`,
    );
  }
}
