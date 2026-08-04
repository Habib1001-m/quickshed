/**
 * The fixed category taxonomy for the QS-SPEC-001 tool contract.
 *
 * Keep this module free of UI and browser imports so static validation can use
 * it without crossing the client/server boundary.
 */
export const TOOL_CATEGORY_SLUGS = [
  'calculators',
  'time-tools',
  'text-tools',
  'converters',
  'student-tools',
  'pdf-tools',
  'utility-tools',
  'seo-tools',
  'developer-tools',
  'image-tools',
  'security-tools',
] as const;

export type ToolCategorySlug = (typeof TOOL_CATEGORY_SLUGS)[number];
