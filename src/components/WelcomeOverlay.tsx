'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Globe, Search, Heart, Wrench, X, ChevronRight,
  ChevronLeft, Sparkles, ArrowRight, Zap, LayoutGrid,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const WELCOME_KEY = 'quickshed-welcomed';

const STEPS = [
  {
    icon: Shield,
    titleEn: 'Privacy First, Always',
    titleAr: 'الخصوصية أولاً، دائماً',
    descEn: 'Your data never leaves your browser. All tools run locally — no servers, no tracking, no accounts needed.',
    descAr: 'بياناتك لا تغادر متصفحك. جميع الأدوات تعمل محلياً — لا خوادم، لا تتبع، لا حسابات.',
    color: 'emerald',
  },
  {
    icon: Globe,
    titleEn: 'Available in Arabic & English',
    titleAr: 'متوفر بالعربية والإنجليزية',
    descEn: 'Full bilingual support with RTL layout. Switch languages anytime with one click.',
    descAr: 'دعم كامل للغتين مع تخطيط RTL. بدّل اللغات في أي وقت بنقرة واحدة.',
    color: 'sky',
  },
  {
    icon: Search,
    titleEn: '90+ Tools at Your Fingertips',
    titleAr: '+90 أداة في متناول يدك',
    descEn: 'Search instantly with ⌘K, save favorites, and explore tools across 11 categories.',
    descAr: 'ابحث فوراً بـ ⌘K، احفظ المفضلات، واستكشف الأدوات عبر 11 فئة.',
    color: 'violet',
  },
];

export function WelcomeOverlay() {
  const { locale } = useI18n();
  const setLocale = useAppStore((s) => s.setLocale);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(0);
  const isRtl = locale === 'ar';

  useEffect(() => {
    try {
      const welcomed = localStorage.getItem(WELCOME_KEY);
      if (!welcomed) {
        // Small delay for page load
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(WELCOME_KEY, 'true');
    } catch {
      // localStorage not available
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const currentStep = STEPS[step];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div
              className="glass-strong rounded-3xl shadow-2xl border border-border/50 w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <div className="flex justify-end p-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleClose}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Step content */}
              <div className="px-8 pb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center"
                  >
                    {/* Animated icon */}
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 15, delay: 0.1 }}
                      className={`relative flex size-20 items-center justify-center rounded-3xl mb-6 ${
                        currentStep.color === 'emerald'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : currentStep.color === 'sky'
                          ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400'
                          : 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400'
                      }`}
                    >
                      <currentStep.icon className="size-10" />
                      <div className="absolute -top-1 -end-1 flex size-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                        <Sparkles className="size-3.5" />
                      </div>
                    </motion.div>

                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      {locale === 'ar' ? currentStep.titleAr : currentStep.titleEn}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                      {locale === 'ar' ? currentStep.descAr : currentStep.descEn}
                    </p>

                    {/* Step 2: Language selection */}
                    {step === 1 && (
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setLocale('en')}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            locale === 'en'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Globe className="size-4" />
                          English
                        </button>
                        <button
                          onClick={() => setLocale('ar')}
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            locale === 'ar'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          <Globe className="size-4" />
                          عربي
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-2 py-4">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === step
                        ? 'w-8 h-2 bg-emerald-500'
                        : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrev}
                  disabled={step === 0}
                  className="gap-1 text-muted-foreground"
                >
                  <ChevronLeft className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
                  {locale === 'ar' ? 'السابق' : 'Back'}
                </Button>

                <button
                  onClick={handleClose}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'ar' ? 'تخطي' : 'Skip'}
                </button>

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {step === STEPS.length - 1
                    ? (locale === 'ar' ? 'ابدأ' : 'Get Started')
                    : (locale === 'ar' ? 'التالي' : 'Next')
                  }
                  <ChevronRight className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
