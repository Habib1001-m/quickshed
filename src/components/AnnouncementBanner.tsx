'use client';

import { useState, useEffect, useCallback } from 'react';
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
    // Check localStorage on mount (defensive: storage may be unavailable in
    // some browser contexts, e.g. disabled cookies / private mode quota).
    let dismissed: string | null = null;
    try {
      dismissed = localStorage.getItem(BANNER_STORAGE_KEY);
    } catch {
      // localStorage unavailable — treat as not dismissed so the banner shows
    }
    const show = dismissed !== 'true';
    requestAnimationFrame(() => {
      setIsVisible(show);
      onVisibilityChange?.(show);
    });
  }, [onVisibilityChange]);

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, 'true');
    } catch {
      // localStorage unavailable — still hide in this session
    }
    setIsVisible(false);
    onVisibilityChange?.(false);
  }, [onVisibilityChange]);

  // The announcement is useful on a fresh visit, but it should never become
  // a persistent obstacle once the visitor starts using the site.
  useEffect(() => {
    if (!isVisible) return;

    const dismissOnInteraction = () => {
      handleDismiss();
    };
    const options: AddEventListenerOptions = { capture: true, passive: true };

    window.addEventListener('pointerdown', dismissOnInteraction, options);
    window.addEventListener('keydown', dismissOnInteraction, options);
    window.addEventListener('touchstart', dismissOnInteraction, options);
    window.addEventListener('wheel', dismissOnInteraction, options);
    window.addEventListener('scroll', dismissOnInteraction, options);

    return () => {
      window.removeEventListener('pointerdown', dismissOnInteraction, options);
      window.removeEventListener('keydown', dismissOnInteraction, options);
      window.removeEventListener('touchstart', dismissOnInteraction, options);
      window.removeEventListener('wheel', dismissOnInteraction, options);
      window.removeEventListener('scroll', dismissOnInteraction, options);
    };
  }, [handleDismiss, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 inset-x-0 z-[60] overflow-hidden"
          data-testid="announcement-banner"
        >
          <div className="flex h-14 min-w-0 items-center gap-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 animated-banner-gradient px-3 py-2 sm:px-4 md:h-11 md:py-0">
            <div
              className="flex min-w-0 flex-1 items-center justify-center gap-2 text-center text-xs font-medium leading-snug text-white/95 md:text-sm"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span className="min-w-0 line-clamp-2" title={t('common.announcementText')}>
                🎉 {t('common.announcementText')}
              </span>
            </div>
            <button
              onClick={handleDismiss}
              className="ms-1 shrink-0 rounded-full p-1.5 text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white"
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
