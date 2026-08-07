/**
 * Centralized category configuration.
 * Single source of truth for category colors, eliminating duplication across components.
 */

export interface CategoryColorConfig {
  /** Icon container background + text color */
  icon: string;
  /** Badge color (tool count) */
  badge: string;
  /** Pill base color (example tool pills) */
  pill: string;
  /** Pill hover color (example tool pills) */
  pillHover: string;
  /** Border hover color */
  borderHover: string;
  /** Accent line background color (e.g. 'bg-violet-500') */
  accent: string;
  /** Hover shadow color (e.g. 'hover:shadow-violet-500/15') */
  shadow: string;
  /** Hover border color – lighter variant (e.g. 'hover:border-violet-300 dark:hover:border-violet-700') */
  border: string;
  /** Gradient from/to classes for header backgrounds */
  gradient: { from: string; to: string };
  /** Glow color for box-shadow (rgba string) */
  glowColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryColorConfig> = {
  calculators: {
    icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200',
    pill: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    pillHover: 'group-hover:bg-violet-200/60 group-hover:text-violet-800 dark:group-hover:bg-violet-900/30 dark:group-hover:text-violet-300',
    borderHover: 'hover:border-violet-400 dark:hover:border-violet-600',
    accent: 'bg-violet-500',
    shadow: 'hover:shadow-violet-500/15',
    border: 'hover:border-violet-300 dark:hover:border-violet-700',
    gradient: { from: 'from-violet-500/12', to: 'to-violet-400/5' },
    glowColor: 'rgba(139, 92, 246, 0.15)',
  },
  'time-tools': {
    icon: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
    pill: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    pillHover: 'group-hover:bg-sky-200/60 group-hover:text-sky-800 dark:group-hover:bg-sky-900/30 dark:group-hover:text-sky-300',
    borderHover: 'hover:border-sky-400 dark:hover:border-sky-600',
    accent: 'bg-sky-500',
    shadow: 'hover:shadow-sky-500/15',
    border: 'hover:border-sky-300 dark:hover:border-sky-700',
    gradient: { from: 'from-sky-500/12', to: 'to-sky-400/5' },
    glowColor: 'rgba(14, 165, 233, 0.15)',
  },
  'text-tools': {
    icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
    pill: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    pillHover: 'group-hover:bg-rose-200/60 group-hover:text-rose-800 dark:group-hover:bg-rose-900/30 dark:group-hover:text-rose-300',
    borderHover: 'hover:border-rose-400 dark:hover:border-rose-600',
    accent: 'bg-rose-500',
    shadow: 'hover:shadow-rose-500/15',
    border: 'hover:border-rose-300 dark:hover:border-rose-700',
    gradient: { from: 'from-rose-500/12', to: 'to-rose-400/5' },
    glowColor: 'rgba(244, 63, 94, 0.15)',
  },
  converters: {
    icon: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
    pill: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    pillHover: 'group-hover:bg-teal-200/60 group-hover:text-teal-800 dark:group-hover:bg-teal-900/30 dark:group-hover:text-teal-300',
    borderHover: 'hover:border-teal-400 dark:hover:border-teal-600',
    accent: 'bg-teal-500',
    shadow: 'hover:shadow-teal-500/15',
    border: 'hover:border-teal-300 dark:hover:border-teal-700',
    gradient: { from: 'from-teal-500/12', to: 'to-teal-400/5' },
    glowColor: 'rgba(20, 184, 166, 0.15)',
  },
  'student-tools': {
    icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    pill: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    pillHover: 'group-hover:bg-amber-200/60 group-hover:text-amber-800 dark:group-hover:bg-amber-900/30 dark:group-hover:text-amber-300',
    borderHover: 'hover:border-amber-400 dark:hover:border-amber-600',
    accent: 'bg-amber-500',
    shadow: 'hover:shadow-amber-500/15',
    border: 'hover:border-amber-300 dark:hover:border-amber-700',
    gradient: { from: 'from-amber-500/12', to: 'to-amber-400/5' },
    glowColor: 'rgba(245, 158, 11, 0.15)',
  },
  'pdf-tools': {
    icon: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
    pill: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    pillHover: 'group-hover:bg-red-200/60 group-hover:text-red-800 dark:group-hover:bg-red-900/30 dark:group-hover:text-red-300',
    borderHover: 'hover:border-red-400 dark:hover:border-red-600',
    accent: 'bg-red-500',
    shadow: 'hover:shadow-red-500/15',
    border: 'hover:border-red-300 dark:hover:border-red-700',
    gradient: { from: 'from-red-500/12', to: 'to-red-400/5' },
    glowColor: 'rgba(239, 68, 68, 0.15)',
  },
  'utility-tools': {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    pillHover: 'group-hover:bg-emerald-200/60 group-hover:text-emerald-800 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-300',
    borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    accent: 'bg-emerald-500',
    shadow: 'hover:shadow-emerald-500/15',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    gradient: { from: 'from-emerald-500/12', to: 'to-emerald-400/5' },
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  'seo-tools': {
    icon: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    pill: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    pillHover: 'group-hover:bg-orange-200/60 group-hover:text-orange-800 dark:group-hover:bg-orange-900/30 dark:group-hover:text-orange-300',
    borderHover: 'hover:border-orange-400 dark:hover:border-orange-600',
    accent: 'bg-orange-500',
    shadow: 'hover:shadow-orange-500/15',
    border: 'hover:border-orange-300 dark:hover:border-orange-700',
    gradient: { from: 'from-orange-500/12', to: 'to-orange-400/5' },
    glowColor: 'rgba(249, 115, 22, 0.15)',
  },
  'developer-tools': {
    icon: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
    badge: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
    pill: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    pillHover: 'group-hover:bg-cyan-200/60 group-hover:text-cyan-800 dark:group-hover:bg-cyan-900/30 dark:group-hover:text-cyan-300',
    borderHover: 'hover:border-cyan-400 dark:hover:border-cyan-600',
    accent: 'bg-cyan-500',
    shadow: 'hover:shadow-cyan-500/15',
    border: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    gradient: { from: 'from-cyan-500/12', to: 'to-cyan-400/5' },
    glowColor: 'rgba(6, 182, 212, 0.15)',
  },
  'image-tools': {
    icon: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    badge: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
    pill: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    pillHover: 'group-hover:bg-pink-200/60 group-hover:text-pink-800 dark:group-hover:bg-pink-900/30 dark:group-hover:text-pink-300',
    borderHover: 'hover:border-pink-400 dark:hover:border-pink-600',
    accent: 'bg-pink-500',
    shadow: 'hover:shadow-pink-500/15',
    border: 'hover:border-pink-300 dark:hover:border-pink-700',
    gradient: { from: 'from-pink-500/12', to: 'to-pink-400/5' },
    glowColor: 'rgba(236, 72, 153, 0.15)',
  },
  'security-tools': {
    icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    pillHover: 'group-hover:bg-emerald-200/60 group-hover:text-emerald-800 dark:group-hover:bg-emerald-900/30 dark:group-hover:text-emerald-300',
    borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    accent: 'bg-emerald-500',
    shadow: 'hover:shadow-emerald-500/15',
    border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    gradient: { from: 'from-emerald-500/12', to: 'to-emerald-400/5' },
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
};

/** Default color config for unknown categories */
export const DEFAULT_CATEGORY_COLOR: CategoryColorConfig = {
  icon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  pill: 'bg-muted/70 text-muted-foreground',
  pillHover: 'group-hover:bg-gray-200/60 group-hover:text-gray-800 dark:group-hover:bg-gray-800/30 dark:group-hover:text-gray-300',
  borderHover: 'hover:border-gray-400 dark:hover:border-gray-600',
  accent: 'bg-gray-500',
  shadow: 'hover:shadow-gray-500/15',
  border: 'hover:border-gray-300 dark:hover:border-gray-700',
  gradient: { from: 'from-gray-500/12', to: 'to-gray-400/5' },
  glowColor: 'rgba(128, 128, 128, 0.15)',
};

/** Get category color config by slug */
export function getCategoryColor(slug: string): CategoryColorConfig {
  return CATEGORY_COLORS[slug] || DEFAULT_CATEGORY_COLOR;
}
