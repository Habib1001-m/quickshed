'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getCategories, localize } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { getCategoryColor } from '@/lib/category-config';
import type { Locale } from '@/lib/store';

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

export function CategoriesView() {
  const { t, locale } = useI18n();
  const navigateHome = useAppStore((s) => s.navigateHome);
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);
  const isRtl = locale === 'ar';
  const categories = useMemo(() => getCategories(), []);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-sky-50 dark:from-emerald-950/20 dark:via-transparent dark:to-sky-950/20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Button variant="ghost" size="sm" onClick={navigateHome} className="mb-6 -ms-2 gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {isRtl ? 'الرئيسية' : 'Home'}
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-lg">
              <LayoutGrid className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground">{t('home.allCategories')}</h1>
              <p className="text-muted-foreground mt-1">{t('home.browseByCategory')}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </section>

      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {categories.map((category, i) => {
              const colors = getCategoryColor(category.slug);
              const categoryName = localize(category.name, locale as Locale);
              const toolCountLabel = t('home.toolCount', { count: category.toolCount });
              return (
                <motion.div key={category.slug} variants={fadeUp} custom={i}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={categoryName}
                    onClick={() => navigateToCategory(category.slug)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateToCategory(category.slug); } }}
                    className={`group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm card-elevated transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${colors.shadow} ${colors.borderHover} cursor-pointer select-none overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                  >
                    <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
                    <div className="flex items-center gap-3">
                      <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colors.icon} transition-transform duration-300 group-hover:scale-110`}>
                        <DynamicIcon name={category.icon} className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-card-foreground">{categoryName}</h3>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mt-0.5 ${colors.badge}`}>{toolCountLabel}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
