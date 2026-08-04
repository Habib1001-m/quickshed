'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ArrowLeft, Shield, Zap, Search, FilterX, Wrench, FileLock2, Database } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getCategoryBySlug,
  getToolsByCategory,
  localize,
  countByPrivacy,
  type Privacy,
} from '@/lib/tool-utils';
import { ToolCard } from '@/components/ToolCard';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryColor } from '@/lib/category-config';

/**
 * QS-SPEC-001 T005c: privacy filter covers all four levels plus `all`.
 * Derived from the shared {@link Privacy} union, so adding a value to the
 * contract flows through here automatically.
 */
type FilterType = 'all' | Privacy;

/**
 * Exhaustive per-class presentation config (filter label + chart swatch).
 * Typed `Record<Privacy, ...>` so a future enum value fails typecheck until
 * it is added — no local-vs-API-only chart or filter set remains.
 */
const PRIVACY_CLASSES: Record<
  Privacy,
  { filterLabelKey: string; chartLabelKey: string; swatch: string; Icon: typeof Shield }
> = {
  local: {
    filterLabelKey: 'category.filterLocal',
    chartLabelKey: 'tool.privacyLocalShort',
    swatch: 'bg-emerald-500',
    Icon: Shield,
  },
  'file-only': {
    filterLabelKey: 'category.filterFileOnly',
    chartLabelKey: 'tool.privacyFileOnlyShort',
    swatch: 'bg-sky-500',
    Icon: FileLock2,
  },
  storage: {
    filterLabelKey: 'category.filterStorage',
    chartLabelKey: 'tool.privacyStorageShort',
    swatch: 'bg-violet-500',
    Icon: Database,
  },
  api: {
    filterLabelKey: 'category.filterApi',
    chartLabelKey: 'tool.privacyApiShort',
    swatch: 'bg-amber-500',
    Icon: Zap,
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' as const },
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

  // QS-SPEC-001 T005c: reset the privacy filter whenever the selected
  // category changes, so a filter that has no tools in the next category
  // can never carry over and produce a stale empty state. This is the
  // React "adjusting state during render" idiom (a synchronous setState
  // in render, NOT inside an effect), which the repo lint rule permits and
  // which is correct under arbitrary category navigation.
  const [prevCategory, setPrevCategory] = useState(selectedCategory);
  if (selectedCategory !== prevCategory) {
    setPrevCategory(selectedCategory);
    setFilter('all');
  }

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
  const colors = getCategoryColor(category.slug);
  const gradient = colors.gradient;

  // QS-SPEC-001 T005c: exhaustive four-class counts; no local/API-only tally.
  const privacyCounts = countByPrivacy(allCategoryTools);
  const totalInCategory = allCategoryTools.length;
  const onDeviceCount = privacyCounts.local + privacyCounts['file-only'] + privacyCounts.storage;
  const onDevicePercent = totalInCategory > 0 ? Math.round((onDeviceCount / totalInCategory) * 100) : 0;

  const filters: { key: FilterType; label: string; count: number; Icon?: typeof Shield }[] = [
    { key: 'all', label: t('category.filterAll'), count: totalInCategory },
    ...(['local', 'file-only', 'storage', 'api'] as const).map((p) => ({
      key: p,
      label: t(PRIVACY_CLASSES[p].filterLabelKey),
      count: privacyCounts[p],
      Icon: PRIVACY_CLASSES[p].Icon,
    })),
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
              className={`relative flex size-20 md:size-24 items-center justify-center rounded-3xl ${colors.icon} shrink-0 shadow-lg animate-pulse-ring`}
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
                {/* On-device share bar (local + file-only + storage vs api). */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden privacy-progress-animated">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${onDevicePercent}%` }}
                      transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                  </div>
                </div>
                {/* Exhaustive four-class legend; every Privacy value shown. */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
                  {(['local', 'file-only', 'storage', 'api'] as const).map((p) => {
                    const cls = PRIVACY_CLASSES[p];
                    const count = privacyCounts[p];
                    const pct = totalInCategory > 0 ? Math.round((count / totalInCategory) * 100) : 0;
                    return (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1.5 text-foreground/70 font-medium"
                      >
                        <span className={`size-2.5 rounded-full ${cls.swatch} shadow-sm`} />
                        {t(cls.chartLabelKey)}: {count} ({pct}%)
                      </span>
                    );
                  })}
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
                      ? 'bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-800 pill-active-glow'
                      : 'bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  {f.Icon && <f.Icon className="size-3.5" />}
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
