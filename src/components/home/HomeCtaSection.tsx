'use client';

import { motion } from 'framer-motion';
import { Search, Shield, Zap } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getScrollBehavior } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function HomeCtaSection() {
  const { t } = useI18n();
  const navigateToAllTools = useAppStore((s) => s.navigateToAllTools);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden mesh-gradient">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center max-w-2xl mx-auto glass-card-stronger card-elevated rounded-3xl p-10 md:p-14"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 mb-6 animate-pulse-ring">
            <Zap className="size-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('home.readyToStart')}
          </h2>
          <div className="mt-6">
            <Button
              onClick={() => {
                navigateToAllTools();
                setTimeout(() => window.scrollTo({ top: 0, behavior: getScrollBehavior() }), 100);
              }}
              size="lg"
              className="gap-2 rounded-full px-12 h-14 text-base bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl shadow-emerald-500/30 micro-bounce glow-focus"
            >
              <Search className="size-5" />
              {t('home.searchCTA')}
            </Button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="size-4 text-emerald-500" />
            <span>{t('home.privacyFirstDesc')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
