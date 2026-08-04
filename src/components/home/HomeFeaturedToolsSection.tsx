'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getDiverseFeaturedTools } from '@/lib/tool-utils';
import { ToolCard } from '@/components/ToolCard';
import { fadeUp, stagger } from './home-config';

export function HomeFeaturedToolsSection() {
  const { t } = useI18n();
  const navigateToAllTools = useAppStore((s) => s.navigateToAllTools);
  const featuredTools = useMemo(() => getDiverseFeaturedTools(8), []);

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.featuredTools')}
          </h2>
          <button
            onClick={navigateToAllTools}
            className="flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
          >
            {t('home.viewAllTools')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </button>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {featuredTools.map((tool, i) => (
            <motion.div key={tool.id} variants={fadeUp} custom={i}>
              <ToolCard tool={tool} showCategoryAccent />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
