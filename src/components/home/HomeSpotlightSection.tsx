'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getDiverseFeaturedTools, localize } from '@/lib/tool-utils';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { SPOTLIGHT_PRIVACY_ICON, spotlightPrivacyLabelKey } from './home-config';

export function HomeSpotlightSection() {
  const { t, locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const spotlightTool = useMemo(() => getDiverseFeaturedTools(1)[0], []);
  const SpotlightPrivacy = spotlightTool
    ? SPOTLIGHT_PRIVACY_ICON[spotlightTool.privacy]
    : null;

  if (!spotlightTool) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-6"
        >
          <Star className="size-5 text-emerald-500" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.toolSpotlight')}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl glass-card gradient-border overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/3 to-sky-500/5 pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
            <div className="relative shrink-0 icon-float">
              <div className="flex size-24 md:size-28 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-xl animate-pulse-ring">
                <DynamicIcon name={spotlightTool.icon} className="size-12 md:size-14" />
              </div>
              <div className="absolute -top-1 -end-1 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                <Sparkles className="size-4" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-start">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                {localize(spotlightTool.name, locale)}
              </h3>
              <p className="mt-2 text-muted-foreground leading-relaxed max-w-lg">
                {localize(spotlightTool.description, locale)}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <Button
                  onClick={() => navigateToTool(spotlightTool.id)}
                  size="lg"
                  className="gap-2 rounded-full px-10 h-13 text-base bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl shadow-emerald-500/30 micro-bounce glow-focus"
                >
                  <Zap className="size-5" />
                  {t('home.tryNow')}
                </Button>
                {SpotlightPrivacy ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <SpotlightPrivacy.Icon className={`size-3.5 ${SpotlightPrivacy.color}`} />
                    {t(spotlightPrivacyLabelKey(spotlightTool.privacy))}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
