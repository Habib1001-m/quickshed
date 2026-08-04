import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const toolUtilsPath = path.join(projectRoot, 'src', 'lib', 'tool-utils.ts');
const descriptorsPath = path.join(projectRoot, 'src', 'lib', 'tool-descriptors.ts');
const clientChunksPath = path.join(projectRoot, '.next', 'static', 'chunks');
const CLIENT_VALIDATOR_MARKERS = [
  'ToolValidationError',
  'Tool metadata validation failed',
  'runtime index entry differs from the source tool definition',
  'invalid privacy/retention combination',
  'privacy api must not have networkEgress',
  'no tool definitions were provided',
];

const toolUtils = fs.readFileSync(toolUtilsPath, 'utf8');
const descriptors = fs.readFileSync(descriptorsPath, 'utf8');
const issues = [];

if (/tool-validation|parseToolDefinitions|ToolSchema|(?:from|require\s*\()\s*['"]zod/.test(toolUtils)) {
  issues.push('src/lib/tool-utils.ts has a runtime validator/schema dependency');
}

if (!/from ['"]\.\/tool-descriptors['"]/.test(toolUtils)) {
  issues.push('src/lib/tool-utils.ts does not consume the static descriptor module');
}

if (!/import toolsIndex from ['"]\.\.\/\.\.\/content\/tools-index\.json['"]/.test(descriptors)) {
  issues.push('src/lib/tool-descriptors.ts does not import the static tool index');
}

if (!/import type \{ Tool \} from ['"]\.\/tool-schema['"]/.test(descriptors)) {
  issues.push('src/lib/tool-descriptors.ts must keep the Tool contract type-only');
}

if (/^\s*import(?! type)[^;]+from ['"]\.\/tool-schema['"];?/m.test(descriptors)) {
  issues.push('src/lib/tool-descriptors.ts has a runtime tool-schema import');
}

if (!fs.existsSync(clientChunksPath)) {
  issues.push('built client chunks are missing; run the production build before this check');
} else {
  const clientChunks = fs
    .readdirSync(clientChunksPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'));
  for (const entry of clientChunks) {
    const chunkPath = path.join(clientChunksPath, entry.name);
    const chunk = fs.readFileSync(chunkPath, 'utf8');
    for (const marker of CLIENT_VALIDATOR_MARKERS) {
      if (chunk.includes(marker)) {
        issues.push(`built client chunk ${entry.name} contains tool-validator marker: ${marker}`);
      }
    }
  }
}

if (issues.length > 0) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    'Verified client tool boundary: tool-utils consumes static descriptors without runtime tool-validation, tool-schema, or Zod imports.',
  );
}
