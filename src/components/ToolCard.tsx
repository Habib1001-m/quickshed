'use client';

import { useState } from 'react';
import { Heart, ThumbsUp, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localize, getCategoryName, type ToolDescriptor } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { Badge } from '@/components/ui/badge';

// Category color mapping for icon background circles
const CATEGORY_COLORS: Record<string, string> = {
  calculators: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  'time-tools': 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  'text-tools': 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  converters: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
  'student-tools': 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  'pdf-tools': 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  'utility-tools': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  'seo-tools': 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
  'developer-tools': 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-400',
  'image-tools': 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
  'security-tools': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
};

// Category accent line colors
const CATEGORY_ACCENT: Record<string, string> = {
  calculators: 'bg-violet-500',
  'time-tools': 'bg-sky-500',
  'text-tools': 'bg-rose-500',
  converters: 'bg-teal-500',
  'student-tools': 'bg-amber-500',
  'pdf-tools': 'bg-red-500',
  'utility-tools': 'bg-emerald-500',
  'seo-tools': 'bg-orange-500',
  'developer-tools': 'bg-cyan-500',
  'image-tools': 'bg-pink-500',
  'security-tools': 'bg-emerald-500',
};

// Category hover shadow colors
const CATEGORY_SHADOW: Record<string, string> = {
  calculators: 'hover:shadow-violet-500/15',
  'time-tools': 'hover:shadow-sky-500/15',
  'text-tools': 'hover:shadow-rose-500/15',
  converters: 'hover:shadow-teal-500/15',
  'student-tools': 'hover:shadow-amber-500/15',
  'pdf-tools': 'hover:shadow-red-500/15',
  'utility-tools': 'hover:shadow-emerald-500/15',
  'seo-tools': 'hover:shadow-orange-500/15',
  'developer-tools': 'hover:shadow-cyan-500/15',
  'image-tools': 'hover:shadow-pink-500/15',
  'security-tools': 'hover:shadow-emerald-500/15',
};

// Category hover border colors
const CATEGORY_BORDER: Record<string, string> = {
  calculators: 'hover:border-violet-300 dark:hover:border-violet-700',
  'time-tools': 'hover:border-sky-300 dark:hover:border-sky-700',
  'text-tools': 'hover:border-rose-300 dark:hover:border-rose-700',
  converters: 'hover:border-teal-300 dark:hover:border-teal-700',
  'student-tools': 'hover:border-amber-300 dark:hover:border-amber-700',
  'pdf-tools': 'hover:border-red-300 dark:hover:border-red-700',
  'utility-tools': 'hover:border-emerald-300 dark:hover:border-emerald-700',
  'seo-tools': 'hover:border-orange-300 dark:hover:border-orange-700',
  'developer-tools': 'hover:border-cyan-300 dark:hover:border-cyan-700',
  'image-tools': 'hover:border-pink-300 dark:hover:border-pink-700',
  'security-tools': 'hover:border-emerald-300 dark:hover:border-emerald-700',
};

interface ToolCardProps {
  tool: ToolDescriptor;
  showCategoryAccent?: boolean;
}

/**
 * Enhanced tool card with animated gradient border, pulsing icon, "New" badge,
 * hover dot pattern, and refined bottom bar separator.
 */
export function ToolCard({ tool, showCategoryAccent = false }: ToolCardProps) {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toolUsageCount = useAppStore((s) => s.toolUsageCount);

  const [heartAnimating, setHeartAnimating] = useState(false);

  const toolName = localize(tool.name, locale);
  const toolDescription = localize(tool.description, locale);
  const categoryName = getCategoryName(tool.category, locale);
  const colorClass = CATEGORY_COLORS[tool.category] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  const accentClass = CATEGORY_ACCENT[tool.category] || 'bg-gray-500';
  const shadowClass = CATEGORY_SHADOW[tool.category] || 'hover:shadow-emerald-500/15';
  const borderClass = CATEGORY_BORDER[tool.category] || 'hover:border-emerald-300 dark:hover:border-emerald-700';
  const usageCount = toolUsageCount[tool.id] || 0;
  const isNew = usageCount < 5;

  const isRtl = locale === 'ar';
  const isFav = favorites.includes(tool.id);

  const handleClick = () => {
    navigateToTool(tool.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigateToTool(tool.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(tool.id);
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 200);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={toolName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex flex-col rounded-xl border border-border bg-card p-5
        shadow-sm transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg ${shadowClass} ${borderClass}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer select-none overflow-hidden
        gradient-border card-hover-lift card-elevated glow-focus glow-ring-hover tool-card-gradient-border
      `}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Shimmer border effect on hover */}
      {showCategoryAccent && (
        <div className={`absolute top-0 inset-x-0 h-0.5 ${accentClass} transition-all duration-300 group-hover:h-1 group-hover:opacity-80`} />
      )}

      {/* Gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none
          bg-gradient-to-b from-emerald-500/[0.03] to-transparent"
      />

      {/* Dot pattern background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, oklch(0.65 0.18 163 / 6%) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute top-0 inset-x-0 h-px ${accentClass} opacity-50`} />
      </div>

      {/* Privacy badge — top-end, slightly larger, with pulse */}
      <div className="absolute top-3 end-3 z-10 scale-110" data-onboarding="privacy">
        <span className={tool.privacy === 'local' ? 'privacy-badge-pulse' : 'privacy-badge-pulse-amber'}>
          <PrivacyBadge level={tool.privacy} />
        </span>
      </div>

      {/* "New" badge — appears for tools with usage < 5, more prominent */}
      {isNew && (
        <div className="absolute top-3 start-3 z-10">
          <Badge className="badge-bounce bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] px-2 py-0 h-5 font-bold shadow-md shadow-emerald-500/30 border-0">
            {locale === 'ar' ? 'جديد' : 'New'}
          </Badge>
        </div>
      )}

      {/* Favorite heart — below New badge or top-start, enhanced animation */}
      <button
        onClick={handleFavoriteClick}
        aria-label={isFav ? t('home.removeFromFavorites') : t('home.addToFavorites')}
        data-onboarding="favorites"
        className={`
          absolute ${isNew ? 'top-10' : 'top-3'} start-3 z-10
          flex items-center justify-center rounded-full p-1
          transition-all duration-200 micro-bounce
          ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          hover:scale-125
          ${heartAnimating ? 'heart-favorite-anim' : ''}
        `}
      >
        <Heart
          className={`size-4 transition-all duration-200 ${
            isFav
              ? 'fill-red-500 text-red-500'
              : 'text-muted-foreground hover:text-red-400'
          }`}
        />
      </button>

      {/* Recently Used indicator dot */}
      {usageCount > 0 && (
        <div className="recently-used-dot" />
      )}

      {/* Icon + name row */}
      <div className="flex items-start gap-3 mb-2 mt-1">
        <div
          className={`
            flex size-11 shrink-0 items-center justify-center rounded-xl
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
            group-hover:shadow-lg group-hover:shadow-emerald-500/15
            group-hover:animate-pulse
            ${colorClass}
          `}
        >
          <DynamicIcon name={tool.icon} className="size-5" />
        </div>
        <div className="min-w-0 flex-1 pe-14">
          <h3 className="text-sm font-semibold text-card-foreground leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {toolName}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
        {toolDescription}
      </p>

      {/* Bottom bar with gradient separator */}
      <div className="flex flex-col gap-2 mt-auto pt-2">
        <div className="gradient-separator" />
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-foreground/70 font-semibold">
            <DynamicIcon name="LayoutGrid" className="size-3" />
            {categoryName}
          </span>
          <div className="flex items-center gap-2">
            {/* Usage count */}
            {usageCount > 0 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <ThumbsUp className="size-3" />
                {usageCount}
              </span>
            )}
            {/* Arrow indicator */}
            <ArrowRight className="size-3 text-muted-foreground/40 group-hover:text-emerald-500 transition-all duration-300 group-hover:translate-x-0.5 rtl:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
