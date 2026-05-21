'use client';

import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Heart, ArrowLeft, Search, LayoutGrid, List, SortAsc, X, Trash2,
  Sparkles, FolderHeart,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getToolById, localize, getCategoryName, getCategories, type ToolDescriptor } from '@/lib/tool-utils';
import type { Locale } from '@/lib/store';
import { ToolCard } from '@/components/ToolCard';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Fuse from 'fuse.js';
import { getCategoryColor } from '@/lib/category-config';

type SortMode = 'recent' | 'name' | 'category' | 'most-used';
type ViewMode = 'grid' | 'list';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.04 } },
};

export function FavoritesView() {
  const { t, locale } = useI18n();
  const navigateHome = useAppStore((s) => s.navigateHome);
  const favorites = useAppStore((s) => s.favorites);
  const toolUsageCount = useAppStore((s) => s.toolUsageCount);
  const recentTools = useAppStore((s) => s.recentTools);
  const isRtl = locale === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Resolve favorite tool descriptors
  const favoriteToolDescriptors = useMemo(() => {
    return favorites
      .map((id) => getToolById(id))
      .filter((t): t is ToolDescriptor => t !== undefined);
  }, [favorites]);

  // Filter by category
  const filtered = useMemo(() => {
    let tools = favoriteToolDescriptors;
    if (selectedCategory) {
      tools = tools.filter((tool) => tool.category === selectedCategory);
    }
    return tools;
  }, [favoriteToolDescriptors, selectedCategory]);

  // Search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(filtered, {
        keys: [
          { name: 'name.en', weight: 2 },
          { name: 'name.ar', weight: 2 },
          { name: 'keywords', weight: 1 },
          { name: 'category', weight: 0.5 },
        ],
        threshold: 0.4,
      }),
    [filtered]
  );

  const searched = useMemo(() => {
    if (!searchQuery.trim()) return filtered;
    return fuse.search(searchQuery).map((r) => r.item);
  }, [searchQuery, filtered, fuse]);

  // Sort
  const sorted = useMemo(() => {
    const sorted = [...searched];
    switch (sortMode) {
      case 'name':
        return sorted.sort((a, b) =>
          localize(a.name, locale).localeCompare(localize(b.name, locale))
        );
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      case 'most-used':
        return sorted.sort(
          (a, b) => (toolUsageCount[b.id] || 0) - (toolUsageCount[a.id] || 0)
        );
      case 'recent':
      default:
        return sorted.sort((a, b) => {
          const aIdx = recentTools.indexOf(a.id);
          const bIdx = recentTools.indexOf(b.id);
          if (aIdx === -1 && bIdx === -1) return 0;
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        });
    }
  }, [searched, sortMode, locale, toolUsageCount, recentTools]);

  // Group by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, typeof sorted> = {};
    for (const tool of sorted) {
      if (!groups[tool.category]) groups[tool.category] = [];
      groups[tool.category].push(tool);
    }
    return groups;
  }, [sorted]);

  // Categories that have favorites
  const availableCategories = useMemo(() => {
    const cats = new Set(favoriteToolDescriptors.map((t) => t.category));
    return getCategories().filter((c) => cats.has(c.slug));
  }, [favoriteToolDescriptors]);

  const sortModes: { key: SortMode; labelKey: string }[] = [
    { key: 'recent', labelKey: 'favorites.sortRecent' },
    { key: 'name', labelKey: 'favorites.sortName' },
    { key: 'category', labelKey: 'favorites.sortCategory' },
    { key: 'most-used', labelKey: 'favorites.sortMostUsed' },
  ];

  // Empty state
  if (favoriteToolDescriptors.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-red-50 dark:bg-red-950/30 shadow-lg">
            <Heart className="size-10 text-red-400 dark:text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {t('favorites.noFavoritesYet')}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t('favorites.noFavoritesDesc')}
          </p>
          <Button
            onClick={navigateHome}
            className="gap-2 rounded-full px-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 micro-bounce"
          >
            <Sparkles className="size-4" />
            {t('favorites.exploreTools')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <section className="relative page-header-gradient overflow-hidden">
        <div className="absolute inset-0 mesh-gradient pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateHome}
              className="gap-1.5 text-muted-foreground hover:text-foreground back-btn-glow micro-bounce"
            >
              <ArrowLeft className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
              {t('header.home')}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 shadow-lg shadow-red-500/10 animate-pulse-ring">
                <Heart className="size-7 fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                  {t('favorites.myFavorites')}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t('favorites.savedTools', { count: favorites.length })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="results-badge-prominent inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold">
                <Heart className="size-3.5" />
                {favorites.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Filters ────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
              <Input
                type="text"
                placeholder={t('favorites.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 pe-4 h-9 glass-input bg-muted/50 border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 micro-bounce ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm pill-active-glow'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                {t('common.all')}
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 micro-bounce ${
                    selectedCategory === cat.slug
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm pill-active-glow'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {localize(cat.name, locale)}
                </button>
              ))}
            </div>

            {/* Sort + View mode */}
            <div className="flex items-center gap-1.5 ms-auto shrink-0">
              {/* Sort dropdown */}
              {sortModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setSortMode(mode.key)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 micro-bounce ${
                    sortMode === mode.key
                      ? 'bg-emerald-500 text-white shadow-sm pill-active-glow'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {t(mode.labelKey)}
                </button>
              ))}

              <div className="w-px h-5 bg-border/50 mx-1" />

              {/* View mode toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="List view"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Content ────────────────────────────────────────── */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {sortMode === 'category' && !searchQuery && !selectedCategory ? (
            // Grouped by category
            <div className="space-y-8">
              {Object.entries(groupedByCategory).map(([catSlug, tools]) => {
                const catName = getCategoryName(catSlug, locale);
                const colorClass = getCategoryColor(catSlug).icon;
                return (
                  <div key={catSlug}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className={`flex size-7 items-center justify-center rounded-md ${colorClass}`}>
                        <DynamicIcon name={getCategories().find(c => c.slug === catSlug)?.icon || 'Wrench'} className="size-3.5" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{catName}</h2>
                      <Badge variant="secondary" className="text-xs">{tools.length}</Badge>
                    </div>
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, margin: '-40px' }}
                      variants={stagger}
                      className={viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        : 'flex flex-col gap-3'
                      }
                    >
                      {tools.map((tool, i) => (
                        <motion.div key={tool.id} variants={fadeUp} custom={i}>
                          {viewMode === 'grid' ? (
                            <ToolCard tool={tool} showCategoryAccent />
                          ) : (
                            <FavoriteListItem tool={tool} locale={locale} />
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Flat list / grid
            <>
              {sorted.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Search className="size-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    {t('favorites.noMatchingFavorites')}
                  </p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    {t('favorites.tryDifferentSearch')}
                  </p>
                </div>
              ) : (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={stagger}
                  className={viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5'
                    : 'flex flex-col gap-3'
                  }
                >
                  {sorted.map((tool, i) => (
                    <motion.div key={tool.id} variants={fadeUp} custom={i}>
                      {viewMode === 'grid' ? (
                        <ToolCard tool={tool} showCategoryAccent />
                      ) : (
                        <FavoriteListItem tool={tool} locale={locale} />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── List Item Component ─────────────────────────────────────

function FavoriteListItem({ tool, locale }: { tool: ToolDescriptor; locale: Locale }) {
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const toolUsageCount = useAppStore((s) => s.toolUsageCount);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  if (!tool) return null;

  const toolName = localize(tool.name, locale);
  const categoryName = getCategoryName(tool.category, locale);
  const colorClass = getCategoryColor(tool.category).icon;
  const usageCount = toolUsageCount[tool.id] || 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigateToTool(tool.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigateToTool(tool.id);
        }
      }}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-red-300 dark:hover:border-red-700 cursor-pointer"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colorClass} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
        <DynamicIcon name={tool.icon} className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {toolName}
        </p>
        <p className="text-xs text-muted-foreground">{categoryName}</p>
      </div>
      {usageCount > 0 && (
        <span className="text-xs text-muted-foreground font-medium">{usageCount}×</span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(tool.id);
        }}
        className="shrink-0 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        aria-label="Remove from favorites"
      >
        <Heart className="size-4 fill-red-500 text-red-500" />
      </button>
    </div>
  );
}
