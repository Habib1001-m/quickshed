import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createJiti } from 'jiti';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const fixturePath = path.join(
  projectRoot,
  'tests',
  'fixtures',
  'tool-validation',
  'fixture-manifest.json',
);
const manifest = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const jiti = createJiti(import.meta.url);

const {
  formatToolValidationIssues,
  QUICKSHED_TOOL_VALIDATION_REFERENCES,
  validateToolDefinitions,
} = await jiti.import('../src/lib/tool-validation.ts');

function clone(value) {
  return structuredClone(value);
}

function setPath(target, pathExpression, value) {
  const segments = pathExpression.split('.');
  const lastSegment = segments.pop();
  let cursor = target;
  for (const segment of segments) {
    cursor = cursor[segment];
  }
  cursor[lastSegment] = clone(value);
}

function deletePath(target, pathExpression) {
  const segments = pathExpression.split('.');
  const lastSegment = segments.pop();
  let cursor = target;
  for (const segment of segments) {
    cursor = cursor[segment];
  }
  delete cursor[lastSegment];
}

function buildDefinition(mutation = {}) {
  const definition = clone(manifest.base);
  for (const [pathExpression, value] of Object.entries(mutation.set ?? {})) {
    setPath(definition, pathExpression, value);
  }
  for (const pathExpression of mutation.remove ?? []) {
    deletePath(definition, pathExpression);
  }
  return definition;
}

function buildDefinitions(fixture) {
  if (fixture.variants) return fixture.variants.map(buildDefinition);
  return [buildDefinition(fixture)];
}

function buildReferences(fixture) {
  const references = { ...QUICKSHED_TOOL_VALIDATION_REFERENCES };
  if (fixture.references?.supportedLocales) {
    references.supportedLocales = [...fixture.references.supportedLocales];
  }
  if (fixture.references?.routePageExists !== undefined) {
    references.routePageExists = fixture.references.routePageExists;
  }
  return references;
}

function issueCodes(result) {
  return new Set(result.success ? [] : result.issues.map((issue) => issue.code));
}

const failures = [];
const positiveData = [];

for (const fixture of manifest.positive) {
  const result = validateToolDefinitions(buildDefinitions(fixture), buildReferences(fixture));
  if (!result.success) {
    failures.push(
      `positive ${fixture.id} failed:\n${formatToolValidationIssues(result.issues)}`,
    );
    continue;
  }
  positiveData.push(result.data[0]);
}

for (const fixture of manifest.negative) {
  const result = validateToolDefinitions(buildDefinitions(fixture), buildReferences(fixture));
  if (result.success) {
    failures.push(`negative ${fixture.id} unexpectedly passed`);
    continue;
  }

  const codes = issueCodes(result);
  for (const expectedCode of fixture.expectedCodes ?? []) {
    if (!codes.has(expectedCode)) {
      failures.push(
        `negative ${fixture.id} did not produce expected code ${expectedCode}; received ${[
          ...codes,
        ].join(', ')}`,
      );
    }
  }
}

for (const [field, expectedValues] of Object.entries(manifest.coverage)) {
  const observedValues = new Set(positiveData.map((definition) => definition[field]));
  for (const expectedValue of expectedValues) {
    if (!observedValues.has(expectedValue)) {
      failures.push(`positive coverage is missing ${field}=${expectedValue}`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${manifest.positive.length} positive and ${manifest.negative.length} negative tool fixtures; enum coverage is complete.`,
  );
}
