'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { ACCENT_BORDER_COLORS, FEATURES, fadeUp, stagger } from './home-config';

export function HomeFeatureSection() {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold gradient-text section-heading">
            {t('home.whyQuickShed')}
          </h2>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.titleKey}
              variants={fadeUp}
              custom={i}
              style={{ borderTopWidth: '4px', borderTopColor: ACCENT_BORDER_COLORS[feature.accent] || '#10b981' }}
              className={`
                group relative flex flex-col items-center text-center gap-4 rounded-2xl
                glass-card feature-card bg-gradient-to-br ${feature.gradient} bg-card p-8 md:p-10
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10
                hover:border-emerald-500/20 dark:hover:border-emerald-500/10
                overflow-hidden
              `}
            >
              <span className="absolute top-3 end-4 text-6xl font-black text-foreground/[0.08] dark:text-foreground/[0.08] select-none leading-none">
                {feature.number}
              </span>

              <div className={`absolute top-0 end-0 w-20 h-20 bg-${feature.accent}-500/5 dark:bg-${feature.accent}-400/5 rounded-bl-3xl`} />

              <div
                className={`
                  relative flex size-18 items-center justify-center rounded-full ring-2 ${feature.color} ${feature.ring}
                  transition-all duration-500 group-hover:scale-110 group-hover:rotate-6
                  group-hover:shadow-lg group-hover:shadow-${feature.accent}-500/20
                `}
              >
                <feature.icon className="size-9 transition-transform duration-500 group-hover:scale-110" />
                <div className={`absolute inset-0 rounded-full ring-2 ring-${feature.accent}-500/0 transition-all duration-500 group-hover:ring-${feature.accent}-500/30 group-hover:scale-125`} />
              </div>
              <h3 className="text-lg font-bold text-card-foreground relative z-10">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground relative z-10">
                {t(feature.descKey)}
              </p>
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
