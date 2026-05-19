'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Heart, FolderPlus, BarChart3 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';

// ─── Animated Number Counter (reused pattern) ──────────────────────

function AnimatedNumber({ value }: { value: number }) {
  return (
    <span className="text-2xl md:text-3xl font-bold gradient-text tabular-nums">
      {value}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  index: number;
}

function StatCard({ icon: Icon, value, label, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`
        glass-card flex flex-col items-center gap-2 rounded-2xl p-4 md:p-5
        border border-border/40
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10
        hover:border-emerald-500/30
      `}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110">
        <Icon className="size-5" />
      </div>
      <AnimatedNumber value={value} />
      <span className="text-xs text-muted-foreground font-medium text-center">
        {label}
      </span>
    </motion.div>
  );
}

// ─── UsageDashboard Component ──────────────────────────────────────

export function UsageDashboard() {
  const { t, locale } = useI18n();
  const favorites = useAppStore((s) => s.favorites);
  const toolUsageCount = useAppStore((s) => s.toolUsageCount);
  const collections = useAppStore((s) => s.collections);
  const isRtl = locale === 'ar';

  // Compute stats from store data
  const stats = useMemo(() => {
    const usedToolIds = Object.keys(toolUsageCount);
    const toolsUsed = usedToolIds.length;
    const totalUses = Object.values(toolUsageCount).reduce((sum, count) => sum + count, 0);
    const favoritesCount = favorites.length;
    const collectionsCount = collections.length;

    return { toolsUsed, totalUses, favoritesCount, collectionsCount };
  }, [toolUsageCount, favorites, collections]);

  // Only render if the user has used at least 1 tool
  if (stats.toolsUsed === 0) return null;

  const cards = [
    {
      icon: Wrench,
      value: stats.toolsUsed,
      label: t('common.toolsUsed'),
    },
    {
      icon: Heart,
      value: stats.favoritesCount,
      label: t('common.favorites'),
    },
    {
      icon: FolderPlus,
      value: stats.collectionsCount,
      label: t('common.collections'),
    },
    {
      icon: BarChart3,
      value: stats.totalUses,
      label: t('common.totalUsage'),
    },
  ];

  return (
    <section className="py-8 md:py-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 mb-5"
        >
          <BarChart3 className="size-5 text-emerald-500" />
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {t('common.usageDashboard')}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {cards.map((card, i) => (
            <StatCard
              key={card.label}
              icon={card.icon}
              value={card.value}
              label={card.label}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
