import type { Locale } from './store';
import type { Privacy, Tool } from './tool-schema';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import toolsIndex from '../../content/tools-index.json';
import {
  parseToolDefinitions,
  QUICKSHED_TOOL_VALIDATION_REFERENCES,
} from './tool-validation';
import type { ToolCategorySlug } from './tool-taxonomy';

// Re-export the shared four-level privacy union so UI consumers import the
// contract from one place alongside the helpers below.
export type { Privacy } from './tool-schema';

// ─── Type Definitions ────────────────────────────────────────────────

export interface LocalizedString {
  ar: string;
  en: string;
}

/**
 * QS-SPEC-001 T005a: ToolDescriptor is the shared/inferred contract from
 * tool-schema.ts — id, slug, name, description, category, icon, component,
 * route, privacy, offline, retention, riskLevel, keywords, inputs, outputs,
 * evidence, createdAt?, updatedAt?. The local LocalizedString below is kept
 * for Category/localize() consumers; it is structurally identical to the
 * schema's LocalizedStringSchema, so the two interoperate without drift.
 */
export type ToolDescriptor = Tool;

export interface Category {
  slug: ToolCategorySlug;
  name: LocalizedString;
  icon: string;
  toolCount: number;
}

// ─── Category Metadata ───────────────────────────────────────────────

const CATEGORY_METADATA: Array<{
  slug: ToolCategorySlug;
  name: LocalizedString;
  icon: string;
}> = [
  { slug: 'calculators', name: { ar: 'الآلات الحاسبة', en: 'Calculators' }, icon: 'Calculator' },
  { slug: 'time-tools', name: { ar: 'أدوات الوقت', en: 'Time Tools' }, icon: 'Clock' },
  { slug: 'text-tools', name: { ar: 'أدوات النص', en: 'Text Tools' }, icon: 'Type' },
  { slug: 'converters', name: { ar: 'أدوات التحويل', en: 'Converters' }, icon: 'ArrowLeftRight' },
  { slug: 'student-tools', name: { ar: 'أدوات الطلاب', en: 'Student Tools' }, icon: 'GraduationCap' },
  { slug: 'pdf-tools', name: { ar: 'أدوات PDF', en: 'PDF Tools' }, icon: 'FileText' },
  { slug: 'utility-tools', name: { ar: 'الأدوات المساعدة', en: 'Utility Tools' }, icon: 'Wrench' },
  { slug: 'seo-tools', name: { ar: 'أدوات SEO', en: 'SEO Tools' }, icon: 'Search' },
  { slug: 'developer-tools', name: { ar: 'أدوات المطورين', en: 'Developer Tools' }, icon: 'Code' },
  { slug: 'image-tools', name: { ar: 'أدوات الصور', en: 'Image Tools' }, icon: 'Image' },
  { slug: 'security-tools', name: { ar: 'أدوات الأمان', en: 'Security Tools' }, icon: 'Shield' },
];

// ─── Helper Functions ────────────────────────────────────────────────

/**
 * Get a localized string from a LocalizedString object.
 */
export function localize(ls: LocalizedString, locale: Locale): string {
  return ls[locale] || ls.en;
}

/**
 * Get the localized category name from the translation files.
 */
export function getCategoryName(slug: string, locale: Locale): string {
  const translations = locale === 'ar' ? ar : en;
  const categoryTranslations = translations.category as Record<string, string>;
  return categoryTranslations[slug] || slug;
}

// ─── Tool Query Functions ────────────────────────────────────────────

/**
 * Get all tools from the static index.
 *
 * QS-SPEC-001 T008: parse the imported metadata once at module load so the
 * client never consumes an unchecked descriptor cast. The same pure validator
 * is used by the build-time source-file pass.
 */
const validatedToolsIndex = parseToolDefinitions(toolsIndex, QUICKSHED_TOOL_VALIDATION_REFERENCES);

export function getAllTools(): ToolDescriptor[] {
  return validatedToolsIndex;
}

/**
 * Get tools filtered by category slug.
 */
export function getToolsByCategory(categorySlug: string): ToolDescriptor[] {
  return getAllTools().filter((tool) => tool.category === categorySlug);
}

/**
 * Get a single tool by its ID (or slug, since they are the same).
 */
export function getToolById(toolId: string): ToolDescriptor | undefined {
  return getAllTools().find((tool) => tool.id === toolId || tool.slug === toolId);
}

/**
 * Get all categories with their tool counts.
 */
export function getCategories(): Category[] {
  const tools = getAllTools();
  return CATEGORY_METADATA.map((meta) => ({
    slug: meta.slug,
    name: meta.name,
    icon: meta.icon,
    toolCount: tools.filter((tool) => tool.category === meta.slug).length,
  }));
}

/**
 * Get a single category by slug with tool count.
 */
export function getCategoryBySlug(slug: string): Category | undefined {
  const tools = getAllTools();
  const meta = CATEGORY_METADATA.find((m) => m.slug === slug);
  if (!meta) return undefined;
  return {
    slug: meta.slug,
    name: meta.name,
    icon: meta.icon,
    toolCount: tools.filter((tool) => tool.category === slug).length,
  };
}

/**
 * Get related tools (same category, excluding the current tool).
 */
export function getRelatedTools(toolId: string, limit = 4): ToolDescriptor[] {
  const tool = getToolById(toolId);
  if (!tool) return [];
  return getToolsByCategory(tool.category)
    .filter((t) => t.id !== toolId)
    .slice(0, limit);
}

// ─── Four-level privacy presentation helpers (QS-SPEC-001 T005c) ─────

/**
 * True for the on-device classes: `local`, `file-only`, `storage`. The
 * switch is exhaustive over {@link Privacy}; a fifth enum value fails
 * typecheck (the function must return on every path), so callers cannot
 * silently regress to a binary local-vs-API fallthrough. `api` is the only
 * connection-required class.
 */
export function isOnDevice(privacy: Privacy): boolean {
  switch (privacy) {
    case 'local':
    case 'file-only':
    case 'storage':
      return true;
    case 'api':
      return false;
  }
}

/**
 * Exhaustive per-class tally. The literal initializer is typed
 * `Record<Privacy, number>`, so a future enum value fails typecheck until
 * it is added to the initializer — the four-value contract stays intact.
 */
export function countByPrivacy(tools: ToolDescriptor[]): Record<Privacy, number> {
  const counts: Record<Privacy, number> = { local: 0, 'file-only': 0, storage: 0, api: 0 };
  for (const tool of tools) counts[tool.privacy]++;
  return counts;
}

/**
 * Get featured tools from different categories (one per category, cycling if needed).
 */
export function getDiverseFeaturedTools(limit = 8): ToolDescriptor[] {
  const tools = getAllTools();
  const categories = getCategories();
  const result: ToolDescriptor[] = [];

  for (const cat of categories) {
    const catTools = tools.filter((t) => t.category === cat.slug);
    if (catTools.length > 0) {
      result.push(catTools[0]);
    }
    if (result.length >= limit) break;
  }

  // If we still need more, fill from remaining tools
  if (result.length < limit) {
    const existingIds = new Set(result.map((t) => t.id));
    const remaining = tools.filter((t) => !existingIds.has(t.id));
    for (const tool of remaining) {
      result.push(tool);
      if (result.length >= limit) break;
    }
  }

  return result.slice(0, limit);
}
