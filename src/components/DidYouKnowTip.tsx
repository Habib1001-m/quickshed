'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const TIP_KEYS = [
  'common.tipKeyboardNav',
  'common.tipCommandPalette',
  'common.tipPrivacyBadge',
  'common.tipFavorites',
  'common.tipCollections',
];

const AUTO_ROTATE_INTERVAL = 8000;

export function DidYouKnowTip() {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const goNext = useCallback(() => {
    setSlideDirection(isRtl ? 'right' : 'left');
    setCurrentIndex((prev) => (prev + 1) % TIP_KEYS.length);
  }, [isRtl]);

  const goPrev = useCallback(() => {
    setSlideDirection(isRtl ? 'left' : 'right');
    setCurrentIndex((prev) => (prev - 1 + TIP_KEYS.length) % TIP_KEYS.length);
  }, [isRtl]);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, goNext]);

  const slideX = slideDirection === 'left' ? 30 : -30;

  return (
    <section className="py-8 md:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Decorative animated gradient accent */}
          <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 opacity-80" />

          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="flex items-start gap-4 relative z-10">
            {/* Lightbulb + Sparkles icon */}
            <div className="relative shrink-0">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                <Lightbulb className="size-5" />
              </div>
              <div className="absolute -top-1 -end-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                <Sparkles className="size-2.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gradient-animated inline-block mb-2">
                {t('common.tipTitle')}
              </h3>

              <div className="relative min-h-[2.5rem] overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={currentIndex}
                    initial={{ opacity: 0, x: slideX }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -slideX }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="text-sm text-foreground leading-relaxed"
                  >
                    {t(TIP_KEYS[currentIndex])}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Dots and navigation */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5">
                  {TIP_KEYS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSlideDirection(i > currentIndex ? 'left' : 'right');
                        setCurrentIndex(i);
                      }}
                      className={`size-2 rounded-full transition-all duration-300 ${
                        i === currentIndex
                          ? 'bg-emerald-500 w-4'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                      aria-label={locale === 'ar' ? `نصيحة ${i + 1}` : `Tip ${i + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1 ms-auto">
                  <button
                    onClick={goPrev}
                    className="flex size-7 items-center justify-center rounded-full hover:bg-muted/70 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label={locale === 'ar' ? 'السابق' : 'Previous'}
                  >
                    <ChevronLeft className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                  <button
                    onClick={goNext}
                    className="flex size-7 items-center justify-center rounded-full hover:bg-muted/70 transition-colors text-muted-foreground hover:text-foreground"
                    aria-label={locale === 'ar' ? 'التالي' : 'Next'}
                  >
                    <ChevronRight className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
