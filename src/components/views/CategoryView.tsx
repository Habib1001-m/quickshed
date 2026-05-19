'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Search, FilterX, Wrench } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getCategoryBySlug,
  getToolsByCategory,
  localize,
} from '@/lib/tool-utils';
import { ToolCard } from '@/components/ToolCard';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Category gradient colors for the header background and icon
const CATEGORY_GRADIENT: Record<string, { from: string; to: string; iconBg: string; iconText: string }> = {
  calculators: {
    from: 'from-violet-500/14',
    to: 'to-violet-400/6',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconText: 'text-violet-600 dark:text-violet-400',
  },
  'time-tools': {
    from: 'from-sky-500/14',
    to: 'to-sky-400/6',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
  },
  'text-tools': {
    from: 'from-rose-500/14',
    to: 'to-rose-400/6',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
  },
  converters: {
    from: 'from-teal-500/14',
    to: 'to-teal-400/6',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconText: 'text-teal-600 dark:text-teal-400',
  },
  'student-tools': {
    from: 'from-amber-500/14',
    to: 'to-amber-400/6',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
  },
  'pdf-tools': {
    from: 'from-red-500/14',
    to: 'to-red-400/6',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconText: 'text-red-600 dark:text-red-400',
  },
  'utility-tools': {
    from: 'from-emerald-500/14',
    to: 'to-emerald-400/6',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
  'seo-tools': {
    from: 'from-orange-500/14',
    to: 'to-orange-400/6',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconText: 'text-orange-600 dark:text-orange-400',
  },
  'developer-tools': {
    from: 'from-cyan-500/14',
    to: 'to-cyan-400/6',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconText: 'text-cyan-600 dark:text-cyan-400',
  },
  'image-tools': {
    from: 'from-pink-500/14',
    to: 'to-pink-400/6',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
    iconText: 'text-pink-600 dark:text-pink-400',
  },
  'security-tools': {
    from: 'from-emerald-500/14',
    to: 'to-emerald-400/6',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
  },
};

const DEFAULT_GRADIENT = {
  from: 'from-gray-500/14',
  to: 'to-gray-400/6',
  iconBg: 'bg-gray-100 dark:bg-gray-800',
  iconText: 'text-gray-600 dark:text-gray-400',
};

type FilterType = 'all' | 'local' | 'api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

export function CategoryView() {
  const { t, locale } = useI18n();
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const navigateHome = useAppStore((s) => s.navigateHome);

  const [filter, setFilter] = useState<FilterType>('all');
  const isRtl = locale === 'ar';

  // Get category data
  const category = useMemo(
    () => (selectedCategory ? getCategoryBySlug(selectedCategory) : undefined),
    [selectedCategory]
  );

  const allCategoryTools = useMemo(
    () => (selectedCategory ? getToolsByCategory(selectedCategory) : []),
    [selectedCategory]
  );

  // Filter tools by privacy level
  const filteredTools = useMemo(() => {
    if (filter === 'all') return allCategoryTools;
    return allCategoryTools.filter((tool) => tool.privacy === filter);
  }, [allCategoryTools, filter]);

  // If no category selected, show not found and redirect
  if (!category) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <p className="text-lg text-muted-foreground">Category not found</p>
        <Button variant="outline" onClick={navigateHome}>
          {t('category.backToCategories')}
        </Button>
      </div>
    );
  }

  const categoryName = localize(category.name, locale);
  const gradient = CATEGORY_GRADIENT[category.slug] || DEFAULT_GRADIENT;

  const localCount = allCategoryTools.filter((tool) => tool.privacy === 'local').length;
  const apiCount = allCategoryTools.filter((tool) => tool.privacy === 'api').length;
  const localPercent = allCategoryTools.length > 0 ? Math.round((localCount / allCategoryTools.length) * 100) : 0;
  const apiPercent = allCategoryTools.length > 0 ? Math.round((apiCount / allCategoryTools.length) * 100) : 0;

  const filters: { key: FilterType; label: string; count: number; icon?: typeof Shield }[] = [
    { key: 'all', label: t('category.filterAll'), count: allCategoryTools.length },
    { key: 'local', label: t('category.filterLocal'), count: localCount, icon: Shield },
    { key: 'api', label: t('category.filterApi'), count: apiCount, icon: Zap },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Category Header with gradient background ─────────────────── */}
      <section className="relative overflow-hidden border-b">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to} via-transparent pointer-events-none mesh-gradient`} />

        {/* Dot pattern texture */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateHome}
            className="mb-6 -ms-2 gap-1.5 text-muted-foreground hover:text-foreground micro-bounce glow-focus back-btn-glow"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t('category.backToCategories')}
          </Button>

          {/* Category info with large icon */}
          <div className="flex items-center gap-5 md:gap-6">
            {/* Large icon with gradient circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`relative flex size-20 md:size-24 items-center justify-center rounded-3xl ${gradient.iconBg} shrink-0 shadow-lg animate-pulse-ring`}
            >
              <DynamicIcon name={category.icon} className="size-10 md:size-12" />
              {/* Decorative ring */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-foreground/5" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-2xl md:text-4xl font-bold text-foreground"
              >
                {categoryName}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="flex items-center gap-3 mt-2"
              >
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  <Wrench className="size-3.5" />
                  {t('category.toolsInCategory', { count: category.toolCount })}
                </Badge>
              </motion.div>

              {/* ─── Privacy Breakdown Mini-Chart ─────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-4 glass-card rounded-xl p-4"
              >
                {/* Progress bar showing local vs API split */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden privacy-progress-animated">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${localPercent}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-5 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-foreground/70 font-medium">
                    <span className="size-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                    {locale === 'ar' ? 'محلي' : 'Local'}: {localCount} ({localPercent}%)
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-foreground/70 font-medium">
                    <span className="size-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/30" />
                    {locale === 'ar' ? 'API' : 'API'}: {apiCount} ({apiPercent}%)
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ─── Pill-shaped Filter Tabs ──────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {filters.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`
                    inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium
                    transition-all duration-200 cursor-pointer micro-bounce
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                    ${isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-600 pill-active-glow'
                      : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {f.icon && <f.icon className="size-3.5" />}
                  {f.label}
                  <span
                    className={`
                      inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </motion.div>
        </div>

        {/* Subtle animated gradient border line at the bottom of the header */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </section>

      {/* ─── Tool Grid ─────────────────────────────────────────────── */}
      <section className="py-8 md:py-12 relative">
        {/* Subtle top border gradient line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {filteredTools.length > 0 ? (
              <motion.div
                key={`filter-${filter}`}
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
              >
                {filteredTools.map((tool, i) => (
                  <motion.div key={tool.id} variants={fadeUp} custom={i}>
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key={`empty-${filter}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center py-20 gap-4"
              >
                {/* Friendly empty state */}
                <div className="relative">
                  <div className="flex size-20 items-center justify-center rounded-full bg-muted/60">
                    <FilterX className="size-10 text-muted-foreground/40" />
                  </div>
                  <div className="absolute -bottom-1 -end-1 flex size-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                    <Search className="size-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">
                    {t('search.noResults')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    {t('category.noToolsForFilter')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-2 gap-1.5 rounded-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  {t('category.filterAll')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
