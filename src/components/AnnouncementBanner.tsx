'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const BANNER_STORAGE_KEY = 'quickshed-banner-dismissed';

interface AnnouncementBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
}

export function AnnouncementBanner({ onVisibilityChange }: AnnouncementBannerProps) {
  const { t, locale } = useI18n();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
    const show = dismissed !== 'true';
    requestAnimationFrame(() => {
      setIsVisible(show);
      onVisibilityChange?.(show);
    });
  }, [onVisibilityChange]);

  const handleDismiss = () => {
    localStorage.setItem(BANNER_STORAGE_KEY, 'true');
    setIsVisible(false);
    onVisibilityChange?.(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 44, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 inset-x-0 z-[60] overflow-hidden"
        >
          <div className="h-11 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 animated-banner-gradient flex items-center justify-center px-4">
            <div
              className="flex items-center gap-2 text-white/95 text-sm font-medium text-center flex-1 justify-center"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>🎉 {t('common.announcementText')}</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 ms-2 shrink-0 transition-all duration-200"
              aria-label={t('common.dismissBanner')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
