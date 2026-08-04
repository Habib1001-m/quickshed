'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export function ShortcutHelpFab() {
  const { locale } = useI18n();
  const [pulse, setPulse] = useState(true);

  // Stop pulse after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpen = () => {
    window.dispatchEvent(new CustomEvent('quickshed-keyboard-shortcuts'));
  };

  return (
    <AnimatePresence>
      <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={handleOpen}
          className={`
            flex size-12 items-center justify-center rounded-full
            bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg
            hover:bg-emerald-700 hover:text-white hover:border-emerald-700 hover:shadow-emerald-500/20
            transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
            ${pulse ? 'animate-bounce' : ''}
          `}
          aria-label={locale === 'ar' ? 'اختصارات لوحة المفاتيح' : 'Keyboard shortcuts'}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
          data-testid="shortcut-help-fab"
        >
          <span className="text-sm font-bold text-muted-foreground group-hover:text-white">
            ?
          </span>
      </motion.button>
    </AnimatePresence>
  );
}
