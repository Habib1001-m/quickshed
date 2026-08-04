'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getToolById, type ToolDescriptor } from '@/lib/tool-utils';
import { ToolCard } from '@/components/ToolCard';
import { fadeUp, stagger } from './home-config';

export function HomeFavoritesSection() {
  const { t } = useI18n();
  const favorites = useAppStore((s) => s.favorites);

  const favoriteToolDescriptors = useMemo(() => {
    return favorites
      .map((id) => getToolById(id))
      .filter((tool): tool is ToolDescriptor => tool !== undefined);
  }, [favorites]);

  if (favoriteToolDescriptors.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="size-5 text-red-500 fill-red-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.yourFavorites')}
          </h2>
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {favoriteToolDescriptors.map((tool, i) => (
            <motion.div key={tool.id} variants={fadeUp} custom={i}>
              <ToolCard tool={tool} showCategoryAccent />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
