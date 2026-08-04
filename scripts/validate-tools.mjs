import { createJiti } from 'jiti';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { areJsonValuesEqual } from './tool-parity.mjs';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const jiti = createJiti(import.meta.url);

const {
  formatToolValidationIssues,
  validateToolSources,
} = await jiti.import('../src/lib/tool-validation.ts');
const { TOOL_COMPONENT_NAMES } = await jiti.import('../src/lib/tool-component-registry.ts');
const { TOOL_CATEGORY_SLUGS } = await jiti.import('../src/lib/tool-taxonomy.ts');
const { LOCALES } = await jiti.import('../src/lib/site-config.ts');

const toolDirectory = path.join(projectRoot, 'content', 'tools');
const routePagePath = path.join(projectRoot, 'src', 'app', '[locale]', 'tools', '[slug]', 'page.tsx');
const componentDirectory = path.join(projectRoot, 'src', 'components', 'tools');
const toolFiles = fs
  .readdirSync(toolDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

const parseIssues = [];
const sourceDefinitions = [];
for (const fileName of toolFiles) {
  const sourcePath = path.join('content', 'tools', fileName);
  const absolutePath = path.join(toolDirectory, fileName);
  try {
    sourceDefinitions.push({
      sourcePath,
      raw: JSON.parse(fs.readFileSync(absolutePath, 'utf8')),
    });
  } catch {
    parseIssues.push({
      code: 'invalid-json',
      message: 'tool definition is not valid JSON',
      path: [],
      sourcePath,
    });
  }
}

const references = {
  categorySlugs: TOOL_CATEGORY_SLUGS,
  componentNames: TOOL_COMPONENT_NAMES,
  componentFileExists: (componentName) =>
    fs.existsSync(path.join(componentDirectory, `${componentName}.tsx`)),
  routePageExists: fs.existsSync(routePagePath),
  supportedLocales: LOCALES,
};

const sourceResult = validateToolSources(sourceDefinitions, references);
const indexPath = path.join(projectRoot, 'content', 'tools-index.json');
let indexResult = null;
let indexEntries = null;
try {
  indexEntries = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  if (!Array.isArray(indexEntries)) {
    indexResult = {
      success: false,
      data: null,
      issues: [
        {
          code: 'invalid-index-shape',
          message: 'tool index must contain an array of tool definitions',
          path: [],
          sourcePath: 'content/tools-index.json',
        },
      ],
    };
  } else {
    indexResult = validateToolSources(
      indexEntries.map((raw, index) => ({
        sourcePath: `content/tools-index.json[${index}]`,
        raw,
      })),
      references,
    );
  }
} catch {
  indexResult = {
    success: false,
    data: null,
    issues: [
      {
        code: 'invalid-json',
        message: 'tool index is not valid JSON',
        path: [],
        sourcePath: 'content/tools-index.json',
      },
    ],
  };
}

const parityIssues = [];
if (!parseIssues.length && Array.isArray(indexEntries)) {
  const sourceById = new Map(
    sourceDefinitions
      .filter((definition) => definition.raw && typeof definition.raw.id === 'string')
      .map((definition) => [definition.raw.id, definition]),
  );
  const indexById = new Map(
    indexEntries
      .filter((definition) => definition && typeof definition.id === 'string')
      .map((definition, index) => [definition.id, { definition, index }]),
  );

  for (const [id, sourceDefinition] of sourceById) {
    const indexed = indexById.get(id);
    if (!indexed || !areJsonValuesEqual(sourceDefinition.raw, indexed.definition)) {
      parityIssues.push({
        code: indexed ? 'index-source-mismatch' : 'index-entry-missing',
        message: indexed
          ? 'runtime index entry differs from the source tool definition'
          : 'source tool definition is missing from the runtime index',
        path: [],
        sourcePath: sourceDefinition.sourcePath,
      });
    }
  }

  for (const [id, indexed] of indexById) {
    if (!sourceById.has(id)) {
      parityIssues.push({
        code: 'orphan-index-entry',
        message: 'runtime index entry has no source tool definition',
        path: [],
        sourcePath: `content/tools-index.json[${indexed.index}]`,
      });
    }
  }
}

const issues = [
  ...parseIssues,
  ...(sourceResult.success ? [] : sourceResult.issues),
  ...(indexResult?.success ? [] : indexResult?.issues ?? []),
  ...parityIssues,
];

if (issues.length > 0) {
  console.error(formatToolValidationIssues(issues));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${sourceDefinitions.length} source tool definitions and ${indexResult.data.length} index entries; content/tools-index.json was excluded from the source count.`,
  );
}
