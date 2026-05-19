import type { Locale } from './store';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';
import toolsIndex from '../../content/tools-index.json';

// ─── Type Definitions ────────────────────────────────────────────────

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface ToolDescriptor {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  category: string;
  icon: string;
  privacy: 'local' | 'api';
  keywords: string[];
  component: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  slug: string;
  name: LocalizedString;
  icon: string;
  toolCount: number;
}

// ─── Category Metadata ───────────────────────────────────────────────

const CATEGORY_METADATA: Array<{
  slug: string;
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
 * Get all tools from the tools index.
 */
export function getAllTools(): ToolDescriptor[] {
  return toolsIndex as unknown as ToolDescriptor[];
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

/**
 * Get featured tools (first few tools across categories).
 */
export function getFeaturedTools(limit = 8): ToolDescriptor[] {
  return getAllTools().slice(0, limit);
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
