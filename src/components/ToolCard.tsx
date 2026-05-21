'use client';

import { useState } from 'react';
import { Heart, ThumbsUp, ArrowRight, Shield } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { localize, getCategoryName, type ToolDescriptor } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { Badge } from '@/components/ui/badge';
import { getCategoryColor } from '@/lib/category-config';

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
  const colors = getCategoryColor(tool.category);
  const colorClass = colors.icon;
  const accentClass = colors.accent;
  const shadowClass = colors.shadow;
  const borderClass = colors.border;
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
        hover:scale-[1.02] hover:shadow-xl ${shadowClass} ${borderClass}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer select-none overflow-hidden
        gradient-border card-hover-lift card-elevated glow-focus glow-ring-hover tool-card-gradient-border
        hover:border-emerald-500/20 dark:hover:border-emerald-500/10
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
      <div className="absolute top-3 end-3 z-10" data-onboarding="privacy">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm transition-transform duration-200 group-hover:scale-105 ${
          tool.privacy === 'local'
            ? 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 privacy-badge-pulse'
            : 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 privacy-badge-pulse-amber'
        }`}>
          <Shield className="size-3" />
          {tool.privacy === 'local' ? t('tool.privacyLocalShort') : t('tool.privacyApiShort')}
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
            flex size-12 shrink-0 items-center justify-center rounded-xl
            transition-all duration-300 group-hover:scale-110 group-hover:rotate-3
            group-hover:shadow-lg group-hover:shadow-emerald-500/15
            ${colorClass}
          `}
        >
          <DynamicIcon name={tool.icon} className="size-5" />
        </div>
        <div className="min-w-0 flex-1 pe-16">
          <h3 className="text-sm font-semibold text-card-foreground leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
            {toolName}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3 flex-1">
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
            <ArrowRight className="size-3 text-muted-foreground/40 group-hover:text-emerald-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-300 rtl:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
}
