import { ToolSchema, TOOL_ROUTE_PATTERN, type Tool } from './tool-schema';
import { TOOL_CATEGORY_SLUGS } from './tool-taxonomy';
import { TOOL_COMPONENT_NAMES } from './tool-component-registry';

type ValidationPath = Array<string | number>;

export interface ToolValidationIssue {
  code: string;
  message: string;
  path: ValidationPath;
  sourcePath?: string;
  toolIndex?: number;
  toolId?: string;
}

export interface ToolSourceDefinition {
  sourcePath: string;
  raw: unknown;
}

export interface ToolValidationReferences {
  categorySlugs: readonly string[];
  componentNames: readonly string[];
  componentFileExists?: (componentName: string) => boolean;
  routePageExists?: boolean;
  supportedLocales?: readonly string[];
}

export interface ToolValidationSuccess {
  success: true;
  data: Tool[];
  issues: [];
}

export interface ToolValidationFailure {
  success: false;
  data: null;
  issues: ToolValidationIssue[];
}

export type ToolValidationResult = ToolValidationSuccess | ToolValidationFailure;

export const QUICKSHED_TOOL_VALIDATION_REFERENCES: ToolValidationReferences = {
  categorySlugs: TOOL_CATEGORY_SLUGS,
  componentNames: TOOL_COMPONENT_NAMES,
  supportedLocales: ['en', 'ar'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function rawString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function issueFor(
  issue: Omit<ToolValidationIssue, 'sourcePath' | 'toolIndex' | 'toolId'>,
  toolIndex: number,
  toolId?: string,
): ToolValidationIssue {
  return { ...issue, toolIndex, ...(toolId ? { toolId } : {}) };
}

function kebabCase(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function appendSchemaIssues(
  issues: ToolValidationIssue[],
  index: number,
  toolId: string | undefined,
  schemaIssues: Array<{ code: string; message: string; path: PropertyKey[] }>,
): void {
  for (const schemaIssue of schemaIssues) {
    issues.push(
      issueFor(
        {
          code: `schema-${schemaIssue.code}`,
          message: schemaIssue.message,
          path: schemaIssue.path.map((segment) =>
            typeof segment === 'string' || typeof segment === 'number' ? segment : String(segment),
          ),
        },
        index,
        toolId,
      ),
    );
  }
}

interface ToolStructuralFields {
  id: string;
  slug: string;
  route: string;
  category: string;
  component: string;
}

function appendStructuralIssues(
  issues: ToolValidationIssue[],
  index: number,
  toolId: string | undefined,
  fields: Partial<ToolStructuralFields>,
  references: ToolValidationReferences,
  categorySlugs: ReadonlySet<string>,
  componentNames: ReadonlySet<string>,
): void {
  if (fields.id && !kebabCase(fields.id)) {
    issues.push(
      issueFor(
        { code: 'invalid-id-format', message: 'id must use kebab-case', path: ['id'] },
        index,
        toolId,
      ),
    );
  }
  if (fields.slug && !kebabCase(fields.slug)) {
    issues.push(
      issueFor(
        { code: 'invalid-slug-format', message: 'slug must use kebab-case', path: ['slug'] },
        index,
        toolId,
      ),
    );
  }

  if (fields.route && fields.slug) {
    const expectedRoute = `/[locale]/tools/${fields.slug}`;
    if (!TOOL_ROUTE_PATTERN.test(fields.route) || fields.route !== expectedRoute) {
      issues.push(
        issueFor(
          {
            code: 'unresolved-route',
            message: `route must resolve to ${expectedRoute} for both supported locales`,
            path: ['route'],
          },
          index,
          toolId,
        ),
      );
    }
  }

  if (fields.category && !categorySlugs.has(fields.category)) {
    issues.push(
      issueFor(
        { code: 'unknown-category', message: 'category is outside the fixed taxonomy', path: ['category'] },
        index,
        toolId,
      ),
    );
  }

  if (fields.component && !componentNames.has(fields.component)) {
    issues.push(
      issueFor(
        {
          code: 'unresolved-component',
          message: 'component is not registered in the dynamic tool registry',
          path: ['component'],
        },
        index,
        toolId,
      ),
    );
  } else if (
    fields.component &&
    componentNames.has(fields.component) &&
    references.componentFileExists &&
    !references.componentFileExists(fields.component)
  ) {
    issues.push(
      issueFor(
        {
          code: 'missing-component-file',
          message: 'registered component source file does not exist',
          path: ['component'],
        },
        index,
        toolId,
      ),
    );
  }
}

/**
 * Validate one or more tool definitions without importing React, Next, or a
 * filesystem adapter. The static script supplies the optional source-path
 * checks; the app can use the same function to parse its static index.
 */
export function validateToolDefinitions(
  definitions: readonly unknown[],
  references: ToolValidationReferences = QUICKSHED_TOOL_VALIDATION_REFERENCES,
): ToolValidationResult {
  const issues: ToolValidationIssue[] = [];
  const parsedTools: Tool[] = [];
  const seenIds = new Map<string, number>();
  const seenSlugs = new Map<string, number>();
  const seenRoutes = new Map<string, number>();
  const categorySlugs = new Set(references.categorySlugs);
  const componentNames = new Set(references.componentNames);

  if (definitions.length === 0) {
    issues.push({
      code: 'empty-tool-set',
      message: 'no tool definitions were provided',
      path: [],
    });
  }

  if (references.routePageExists === false) {
    issues.push({
      code: 'route-page-missing',
      message: 'the shared tool route page does not exist',
      path: ['route'],
    });
  }

  if (references.supportedLocales) {
    for (const locale of ['en', 'ar'] as const) {
      if (!references.supportedLocales.includes(locale)) {
        issues.push({
          code: 'locale-missing',
          message: `supported locale ${locale} is not available for tool routes`,
          path: ['route'],
        });
      }
    }
  }

  definitions.forEach((definition, index) => {
    const raw = isRecord(definition) ? definition : undefined;
    const rawId = rawString(raw?.id);
    const rawSlug = rawString(raw?.slug);
    const rawRoute = rawString(raw?.route);

    if (rawId) {
      const previousIndex = seenIds.get(rawId);
      if (previousIndex !== undefined) {
        issues.push(
          issueFor(
            {
              code: 'duplicate-id',
              message: `id duplicates tool at index ${previousIndex}`,
              path: ['id'],
            },
            index,
            rawId,
          ),
        );
      } else {
        seenIds.set(rawId, index);
      }
    }

    if (rawSlug) {
      const previousIndex = seenSlugs.get(rawSlug);
      if (previousIndex !== undefined) {
        issues.push(
          issueFor(
            {
              code: 'duplicate-slug',
              message: `slug duplicates tool at index ${previousIndex}`,
              path: ['slug'],
            },
            index,
            rawId,
          ),
        );
      } else {
        seenSlugs.set(rawSlug, index);
      }
    }

    if (rawRoute) {
      const previousIndex = seenRoutes.get(rawRoute);
      if (previousIndex !== undefined) {
        issues.push(
          issueFor(
            {
              code: 'duplicate-route',
              message: `route duplicates tool at index ${previousIndex}`,
              path: ['route'],
            },
            index,
            rawId ?? rawSlug,
          ),
        );
      } else {
        seenRoutes.set(rawRoute, index);
      }
    }

    const parsed = ToolSchema.safeParse(definition);
    if (!parsed.success) {
      appendSchemaIssues(issues, index, rawId, parsed.error.issues);
      appendStructuralIssues(
        issues,
        index,
        rawId ?? rawSlug,
        {
          id: rawId,
          slug: rawSlug,
          route: rawRoute,
          category: rawString(raw?.category),
          component: rawString(raw?.component),
        },
        references,
        categorySlugs,
        componentNames,
      );
      return;
    }

    const tool = parsed.data;
    parsedTools.push(tool);

    appendStructuralIssues(
      issues,
      index,
      tool.id,
      tool,
      references,
      categorySlugs,
      componentNames,
    );
  });

  if (issues.length > 0) {
    const sortedIssues = [...issues].sort((left, right) => {
      const leftIndex = left.toolIndex ?? -1;
      const rightIndex = right.toolIndex ?? -1;
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
      const leftPath = left.path.join('.');
      const rightPath = right.path.join('.');
      return leftPath.localeCompare(rightPath) || left.code.localeCompare(right.code);
    });
    return { success: false, data: null, issues: sortedIssues };
  }

  return { success: true, data: parsedTools, issues: [] };
}

export function validateTool(
  definition: unknown,
  references: ToolValidationReferences = QUICKSHED_TOOL_VALIDATION_REFERENCES,
): ToolValidationResult {
  return validateToolDefinitions([definition], references);
}

/**
 * Validate definitions while preserving their source paths for build logs.
 * Filesystem/JSON loading stays outside this module; callers provide already
 * parsed values so the validator remains safe to import from the app bundle.
 */
export function validateToolSources(
  definitions: readonly ToolSourceDefinition[],
  references: ToolValidationReferences = QUICKSHED_TOOL_VALIDATION_REFERENCES,
): ToolValidationResult {
  const result = validateToolDefinitions(
    definitions.map((definition) => definition.raw),
    references,
  );

  if (result.success) return result;

  return {
    success: false,
    data: null,
    issues: result.issues.map((issue) =>
      issue.toolIndex === undefined
        ? issue
        : { ...issue, sourcePath: definitions[issue.toolIndex]?.sourcePath },
    ),
  };
}

export class ToolValidationError extends Error {
  readonly issues: ToolValidationIssue[];

  constructor(issues: ToolValidationIssue[]) {
    super(`Tool metadata validation failed with ${issues.length} issue(s):\n${formatToolValidationIssues(issues)}`);
    this.name = 'ToolValidationError';
    this.issues = issues;
  }
}

export function formatToolValidationIssues(issues: readonly ToolValidationIssue[]): string {
  return issues
    .map((issue) => {
      const identity = issue.sourcePath
        ? issue.sourcePath
        : issue.toolId
          ? `tool ${issue.toolId}`
          : `tool index ${issue.toolIndex ?? '?'}`;
      const path = issue.path.length > 0 ? `.${issue.path.join('.')}` : '';
      return `[${issue.code}] ${identity}${path}: ${issue.message}`;
    })
    .join('\n');
}

export function parseToolDefinitions(
  definitions: readonly unknown[],
  references: ToolValidationReferences = QUICKSHED_TOOL_VALIDATION_REFERENCES,
): Tool[] {
  const result = validateToolDefinitions(definitions, references);
  if (!result.success) {
    throw new ToolValidationError(result.issues);
  }
  return result.data;
}

export function parseTool(
  definition: unknown,
  references: ToolValidationReferences = QUICKSHED_TOOL_VALIDATION_REFERENCES,
): Tool {
  const result = validateTool(definition, references);
  if (!result.success) {
    throw new ToolValidationError(result.issues);
  }
  return result.data[0];
}
