'use client';

import { useMemo, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getCategories, localize } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { getCategoryColor } from '@/lib/category-config';
import { CATEGORY_EXAMPLES, fadeUp, stagger } from './home-config';

export function HomeCategoriesSection() {
  const { t, locale } = useI18n();
  const navigateToAllTools = useAppStore((s) => s.navigateToAllTools);
  const categories = useMemo(() => getCategories(), []);

  return (
    <section className="py-12 md:py-20 bg-muted/30" data-onboarding="categories">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
        >
          <h2 data-onboarding="categories-heading" className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.allCategories')}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {t('home.browseByCategory')}
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {categories.map((category, i) => {
            const examples = CATEGORY_EXAMPLES[category.slug] || [];
            const exampleNames = examples.map((example) => example[locale === 'ar' ? 'ar' : 'en']);
            return (
              <motion.div key={category.slug} variants={fadeUp} custom={i}>
                <EnhancedCategoryCard category={category} examples={exampleNames} />
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Button
            onClick={navigateToAllTools}
            variant="outline"
            size="lg"
            className="gap-2 rounded-full px-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-800 dark:hover:text-emerald-400 micro-bounce"
          >
            {t('home.viewAllTools')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

interface EnhancedCategoryCardProps {
  category: ReturnType<typeof getCategories>[0];
  examples: string[];
}

function EnhancedCategoryCard({ category, examples }: EnhancedCategoryCardProps) {
  const { t, locale } = useI18n();
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);

  const categoryName = localize(category.name, locale);
  const toolCountLabel = t('home.toolCount', { count: category.toolCount });
  const isRtl = locale === 'ar';

  const handleClick = () => {
    navigateToCategory(category.slug);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigateToCategory(category.slug);
    }
  };

  const colors = getCategoryColor(category.slug);
  const { borderHover, shadow: shadowHover, badge: badgeColor, pillHover } = colors;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={categoryName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm card-elevated
        transition-all duration-300
        hover:-translate-y-1.5 hover:shadow-xl ${shadowHover} ${borderHover}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        cursor-pointer select-none
        overflow-hidden
      `}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-emerald-500/3 via-transparent to-transparent" />

      <div className="flex items-center gap-3 mb-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <DynamicIcon name={category.icon} className="size-6" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-card-foreground leading-snug">
            {categoryName}
          </h3>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-0.5 ${badgeColor}`}>
            {toolCountLabel}
          </span>
        </div>
      </div>

      {examples.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {examples.map((name) => (
            <span
              key={name}
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] bg-muted/70 text-muted-foreground transition-colors duration-200 ${pillHover}`}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <div className="absolute bottom-4 end-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
        <ChevronRight className="size-4 text-emerald-500 rtl:rotate-180" />
      </div>
    </div>
  );
}
