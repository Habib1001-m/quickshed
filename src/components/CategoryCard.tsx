'use client';

import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localize, type Category } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { getCategoryColor } from '@/lib/category-config';

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
  const accent = getCategoryColor(category.slug);

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
        hover:-translate-y-1.5 hover:shadow-xl ${accent.borderHover} ${accent.shadow}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer select-none overflow-hidden
        hover:border-opacity-60
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
          flex size-16 items-center justify-center rounded-2xl
          transition-all duration-300 group-hover:scale-110 group-hover:rotate-6
          category-icon-bounce group-hover:shadow-lg
          ${accent.icon}
        `}
      >
        <DynamicIcon name={category.icon} className="size-8" />
      </div>

      {/* Category name */}
      <h3 className="text-sm font-semibold text-card-foreground text-center leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
        {categoryName}
      </h3>

      {/* Tool count badge - category-specific colored background */}
      <span
        className={`
          inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold
          transition-transform duration-200 group-hover:scale-105
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
              className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] bg-muted/70 text-muted-foreground ${accent.pillHover} transition-colors duration-200`}
            >
              {locale === 'ar' ? tool.ar : tool.en}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
