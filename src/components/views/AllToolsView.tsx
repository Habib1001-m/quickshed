'use client';

import { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { Search, ArrowLeft, ArrowUpDown, Shield, Zap, Hash, Wrench, GitCompareArrows } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getAllTools, getCategories, getCategoryName, type ToolDescriptor } from '@/lib/tool-utils';
import { getRatingsMap } from '@/lib/tool-ratings';
import { ToolCard } from '@/components/ToolCard';
import { ToolCompare } from '@/components/ToolCompare';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type SortMode = 'name' | 'category' | 'privacy' | 'usage' | 'rating';
type PrivacyFilter = 'all' | 'local' | 'api';

// ─── Animation variants ─────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.03 } },
};

// ─── AllToolsView Component ────────────────────────────────────────

export function AllToolsView() {
  const { t, locale } = useI18n();
  const navigateHome = useAppStore((s) => s.navigateToHome);
  const toolUsageCount = useAppStore((s) => s.toolUsageCount);
  const compareToolIds = useAppStore((s) => s.compareToolIds);
  const isRtl = locale === 'ar';

  // Data
  const allTools = useMemo(() => getAllTools(), []);
  const categories = useMemo(() => getCategories(), []);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortMode, setSortMode] = useState<SortMode>('category');
  const [privacyFilter, setPrivacyFilter] = useState<PrivacyFilter>('all');
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [compareOpen, setCompareOpen] = useState(false);

  // Refs for keyboard navigation
  const gridRef = useRef<HTMLDivElement>(null);

  // Fuse.js search
  const fuse = useMemo(
    () =>
      new Fuse(allTools, {
        keys: [
          { name: 'name.en', weight: 2 },
          { name: 'name.ar', weight: 2 },
          { name: 'keywords', weight: 1.5 },
          { name: 'category', weight: 1 },
          { name: 'description.en', weight: 0.5 },
          { name: 'description.ar', weight: 0.5 },
        ],
        threshold: 0.4,
      }),
    [allTools]
  );

  // Filtered & sorted tools
  const displayedTools = useMemo(() => {
    let tools: ToolDescriptor[];

    // Search filter
    if (searchQuery.trim()) {
      tools = fuse.search(searchQuery, { limit: 100 }).map((r) => r.item);
    } else {
      tools = [...allTools];
    }

    // Category filter
    if (selectedCategory !== 'all') {
      tools = tools.filter((tool) => tool.category === selectedCategory);
    }

    // Privacy filter
    if (privacyFilter !== 'all') {
      tools = tools.filter((tool) => tool.privacy === privacyFilter);
    }

    // Sort
    if (sortMode === 'name') {
      tools.sort((a, b) => {
        const nameA = a.name[locale === 'ar' ? 'ar' : 'en'];
        const nameB = b.name[locale === 'ar' ? 'ar' : 'en'];
        return nameA.localeCompare(nameB, locale === 'ar' ? 'ar' : 'en');
      });
    } else if (sortMode === 'category') {
      tools.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        const nameA = a.name[locale === 'ar' ? 'ar' : 'en'];
        const nameB = b.name[locale === 'ar' ? 'ar' : 'en'];
        return nameA.localeCompare(nameB, locale === 'ar' ? 'ar' : 'en');
      });
    } else if (sortMode === 'privacy') {
      tools.sort((a, b) => {
        if (a.privacy !== b.privacy) {
          return a.privacy === 'local' ? -1 : 1;
        }
        const nameA = a.name[locale === 'ar' ? 'ar' : 'en'];
        const nameB = b.name[locale === 'ar' ? 'ar' : 'en'];
        return nameA.localeCompare(nameB, locale === 'ar' ? 'ar' : 'en');
      });
    } else if (sortMode === 'usage') {
      tools.sort((a, b) => {
        const usageA = toolUsageCount[a.id] || 0;
        const usageB = toolUsageCount[b.id] || 0;
        return usageB - usageA;
      });
    } else if (sortMode === 'rating') {
      const ratingsMap = getRatingsMap();
      tools.sort((a, b) => {
        const ratingA = ratingsMap[a.id] || 0;
        const ratingB = ratingsMap[b.id] || 0;
        return ratingB - ratingA;
      });
    }

    return tools;
  }, [allTools, searchQuery, selectedCategory, sortMode, privacyFilter, fuse, locale, toolUsageCount]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setFocusedIndex(-1);
  }, []);

  const sortModes: { key: SortMode; label: string }[] = [
    { key: 'category', label: t('allTools.sortByCategory') },
    { key: 'name', label: t('allTools.sortByName') },
    { key: 'privacy', label: t('allTools.sortByPrivacy') },
    { key: 'usage', label: t('allTools.sortByUsage') },
    { key: 'rating', label: t('allTools.sortByRating') },
  ];

  const privacyFilters: { key: PrivacyFilter; label: string; icon?: typeof Shield }[] = [
    { key: 'all', label: t('allTools.filterAll') },
    { key: 'local', label: t('allTools.filterLocal'), icon: Shield },
    { key: 'api', label: t('allTools.filterApi'), icon: Zap },
  ];

  // Keyboard navigation for tool grid
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!gridRef.current) return;

      // Only handle arrow keys when not in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const cols = getGridColumns();
      const total = displayedTools.length;

      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const next = Math.min(Math.max(focusedIndex + dir, 0), total - 1);
        setFocusedIndex(next);
        focusCard(next);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(focusedIndex + cols, total - 1);
        setFocusedIndex(next);
        focusCard(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = Math.max(focusedIndex - cols, 0);
        setFocusedIndex(next);
        focusCard(next);
      }
    }

    function getGridColumns(): number {
      if (!gridRef.current) return 4;
      const width = gridRef.current.offsetWidth;
      if (width >= 1024) return 4;
      if (width >= 768) return 3;
      if (width >= 640) return 2;
      return 1;
    }

    function focusCard(index: number) {
      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll('[role="button"]');
      if (cards[index]) {
        (cards[index] as HTMLElement).focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, displayedTools.length]);

  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="mesh-gradient">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateHome}
            className="gap-1.5 text-muted-foreground hover:text-foreground micro-bounce glow-focus back-btn-glow"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t('tool.backToHome')}
          </Button>

          {/* Compare button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompareOpen(true)}
            className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30 micro-bounce"
          >
            <GitCompareArrows className="size-4" />
            {t('common.compareTools')}
            {compareToolIds.length > 0 && (
              <span className="inline-flex items-center justify-center size-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                {compareToolIds.length}
              </span>
            )}
          </Button>
        </div>

        {/* Visual Header Section */}
        <section className="relative overflow-hidden rounded-3xl mb-8 page-header-gradient">
          <div className="relative px-6 py-8 md:px-10 md:py-10">
            <div className="flex items-center gap-5 md:gap-6">
              {/* Large Wrench icon with animated gradient ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative flex size-20 md:size-24 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 shrink-0 shadow-lg animate-pulse-ring"
              >
                <Wrench className="size-10 md:size-12 text-emerald-600 dark:text-emerald-400" />
                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-emerald-500/10" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <motion.h1
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-3xl md:text-4xl font-extrabold text-foreground"
                >
                  {t('allTools.title')}
                  {/* Results count badge next to title */}
                  <span
                    className="ms-3 results-badge-prominent align-middle"
                  >
                    <Hash className="size-3.5" />
                    {displayedTools.length}
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                  className="mt-1 text-muted-foreground"
                >
                  {t('allTools.showing', { shown: displayedTools.length, total: allTools.length })}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Subtle animated gradient line below header */}
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </section>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Search bar */}
          <div className="relative mb-6 max-w-xl">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 start-4 transition-colors duration-200 ${searchFocused ? 'text-emerald-500' : 'text-muted-foreground'}`} />
            <Input
              type="text"
              placeholder={t('allTools.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="ps-12 pe-4 h-12 text-base glass-input rounded-2xl border-border/60 bg-background shadow-sm focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
            />
          </div>

          {/* Advanced Filter Bar */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Privacy filter pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider me-1">
                {t('allTools.filterPrivacy')}:
              </span>
              {privacyFilters.map((pf) => {
                const isActive = privacyFilter === pf.key;
                return (
                  <button
                    key={pf.key}
                    onClick={() => { setPrivacyFilter(pf.key); setFocusedIndex(-1); }}
                    className={`
                      shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium
                      transition-all duration-200 cursor-pointer micro-bounce
                      ${isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 pill-active-glow'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    {pf.icon && <pf.icon className="size-3.5" />}
                    {pf.label}
                  </button>
                );
              })}
            </div>

            {/* Sort pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              {sortModes.map((sm) => {
                const isActive = sortMode === sm.key;
                return (
                  <button
                    key={sm.key}
                    onClick={() => { setSortMode(sm.key); setFocusedIndex(-1); }}
                    className={`
                      shrink-0 rounded-full px-4 py-1.5 text-sm font-medium
                      transition-all duration-200 cursor-pointer micro-bounce
                      ${isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 pill-active-glow'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }
                    `}
                  >
                    {sm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
            <button
              onClick={() => { setSelectedCategory('all'); setFocusedIndex(-1); }}
              className={`
                shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 micro-bounce hover:scale-105
                ${selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm pill-active-glow'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }
              `}
            >
              {t('allTools.allCategories')}
            </button>
            {categories.map((cat) => {
              const catName = getCategoryName(cat.slug, locale);
              return (
                <button
                  key={cat.slug}
                  onClick={() => { setSelectedCategory(cat.slug); setFocusedIndex(-1); }}
                  className={`
                    shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 micro-bounce hover:scale-105
                    ${selectedCategory === cat.slug
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm pill-active-glow'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {catName}
                  <span className="ms-1 text-xs opacity-70">({cat.toolCount})</span>
                </button>
              );
            })}
          </div>

          {/* Results */}
          {displayedTools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="size-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                {t('allTools.noResults')}
              </p>
              <p className="text-sm text-muted-foreground">
                {t('search.searchBy')}
              </p>
            </motion.div>
          ) : (
            <motion.div
              ref={gridRef}
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
            >
              {displayedTools.map((tool, i) => (
                <motion.div key={tool.id} variants={fadeUp} custom={i}>
                  <ToolCard tool={tool} showCategoryAccent />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Compare Tools Dialog */}
      <ToolCompare open={compareOpen} onOpenChange={setCompareOpen} />
    </div>
  );
}
