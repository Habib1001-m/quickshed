'use client';

import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localize, type Category } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';

// Accent colors per category for hover border and icon background
const CATEGORY_ACCENT: Record<string, { bg: string; border: string; badge: string; pill: string; pillHover: string; glowColor: string }> = {
  calculators: {
    bg: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    border: 'hover:border-violet-400 dark:hover:border-violet-600',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    pill: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    pillHover: 'hover:bg-violet-200 hover:text-violet-800 dark:hover:bg-violet-800/40 dark:hover:text-violet-300',
    glowColor: 'rgba(139, 92, 246, 0.15)',
  },
  'time-tools': {
    bg: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    border: 'hover:border-sky-400 dark:hover:border-sky-600',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
    pill: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400',
    pillHover: 'hover:bg-sky-200 hover:text-sky-800 dark:hover:bg-sky-800/40 dark:hover:text-sky-300',
    glowColor: 'rgba(14, 165, 233, 0.15)',
  },
  'text-tools': {
    bg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    border: 'hover:border-rose-400 dark:hover:border-rose-600',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    pill: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    pillHover: 'hover:bg-rose-200 hover:text-rose-800 dark:hover:bg-rose-800/40 dark:hover:text-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.15)',
  },
  converters: {
    bg: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
    border: 'hover:border-teal-400 dark:hover:border-teal-600',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
    pill: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
    pillHover: 'hover:bg-teal-200 hover:text-teal-800 dark:hover:bg-teal-800/40 dark:hover:text-teal-300',
    glowColor: 'rgba(20, 184, 166, 0.15)',
  },
  'student-tools': {
    bg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    border: 'hover:border-amber-400 dark:hover:border-amber-600',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
    pill: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    pillHover: 'hover:bg-amber-200 hover:text-amber-800 dark:hover:bg-amber-800/40 dark:hover:text-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.15)',
  },
  'pdf-tools': {
    bg: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    border: 'hover:border-red-400 dark:hover:border-red-600',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    pill: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    pillHover: 'hover:bg-red-200 hover:text-red-800 dark:hover:bg-red-800/40 dark:hover:text-red-300',
    glowColor: 'rgba(239, 68, 68, 0.15)',
  },
  'utility-tools': {
    bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    border: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    pillHover: 'hover:bg-emerald-200 hover:text-emerald-800 dark:hover:bg-emerald-800/40 dark:hover:text-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
  'seo-tools': {
    bg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    border: 'hover:border-orange-400 dark:hover:border-orange-600',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    pill: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    pillHover: 'hover:bg-orange-200 hover:text-orange-800 dark:hover:bg-orange-800/40 dark:hover:text-orange-300',
    glowColor: 'rgba(249, 115, 22, 0.15)',
  },
  'developer-tools': {
    bg: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
    border: 'hover:border-cyan-400 dark:hover:border-cyan-600',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    pill: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    pillHover: 'hover:bg-cyan-200 hover:text-cyan-800 dark:hover:bg-cyan-800/40 dark:hover:text-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.15)',
  },
  'image-tools': {
    bg: 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
    border: 'hover:border-pink-400 dark:hover:border-pink-600',
    badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    pill: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    pillHover: 'hover:bg-pink-200 hover:text-pink-800 dark:hover:bg-pink-800/40 dark:hover:text-pink-300',
    glowColor: 'rgba(236, 72, 153, 0.15)',
  },
  'security-tools': {
    bg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    border: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    pillHover: 'hover:bg-emerald-200 hover:text-emerald-800 dark:hover:bg-emerald-800/40 dark:hover:text-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.15)',
  },
};

interface CategoryCardProps {
  category: Category;
  exampleTools?: { en: string; ar: string }[];
}

/**
 * Large card for displaying a category on the home page.
 * Shows icon, name, tool count badge, example tools, and has hover effects.
 * Click or keyboard activate navigates to the category.
 */
export function CategoryCard({ category, exampleTools }: CategoryCardProps) {
  const { t, locale } = useI18n();
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);

  const categoryName = localize(category.name, locale);
  const toolCountLabel = t('home.toolCount', { count: category.toolCount });
  const accent = CATEGORY_ACCENT[category.slug] || {
    bg: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    border: 'hover:border-gray-400 dark:hover:border-gray-600',
    badge: 'bg-muted text-muted-foreground',
    pill: 'bg-muted/70 text-muted-foreground',
    pillHover: 'hover:bg-muted hover:text-foreground',
    glowColor: 'rgba(128, 128, 128, 0.15)',
  };

  const isRtl = locale === 'ar';

  const handleClick = () => {
    navigateToCategory(category.slug);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToCategory(category.slug);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={categoryName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex flex-col items-center justify-center gap-3 rounded-xl
        border border-border bg-card p-6 shadow-sm card-elevated
        category-card-hover category-bg-shift
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl ${accent.border}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer select-none
      `}
      style={{
        // Subtle border glow on hover matching category color
        // Applied via CSS transition
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${accent.glowColor}, 0 2px 8px oklch(0 0 0 / 5%)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Category icon in a colored circle - with bounce on hover */}
      <div
        className={`
          flex size-14 items-center justify-center rounded-full
          transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
          category-icon-bounce
          ${accent.bg}
        `}
      >
        <DynamicIcon name={category.icon} className="size-7" />
      </div>

      {/* Category name */}
      <h3 className="text-sm font-semibold text-card-foreground text-center leading-snug">
        {categoryName}
      </h3>

      {/* Tool count badge - category-specific colored background */}
      <span
        className={`
          inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
          ${accent.badge}
        `}
      >
        {toolCountLabel}
      </span>

      {/* Example tools pills */}
      {exampleTools && exampleTools.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-1">
          {exampleTools.slice(0, 2).map((tool) => (
            <span
              key={tool.en}
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] ${accent.pill} ${accent.pillHover} transition-colors duration-200`}
            >
              {locale === 'ar' ? tool.ar : tool.en}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
