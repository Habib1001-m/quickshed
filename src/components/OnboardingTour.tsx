'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  ONBOARDING_STEPS,
  ONBOARDING_START_EVENT,
  WELCOME_COMPLETED_EVENT,
  consumePendingOnboardingStart,
  isWelcomeComplete,
  isOnboardingComplete,
  markOnboardingComplete,
  resetOnboarding,
  type OnboardingStep,
} from '@/lib/onboarding-steps';
import { getScrollBehavior } from '@/lib/utils';

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getSpotlightRect(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const padding = 10;
  return {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function scrollTargetIntoView(step: OnboardingStep) {
  if (step.position === 'center') return;

  const target = document.querySelector(step.targetSelector);
  target?.scrollIntoView({ behavior: getScrollBehavior(), block: 'center', inline: 'nearest' });
}

function getTooltipPosition(
  spotlight: SpotlightRect | null,
  position: OnboardingStep['position'],
  isRtl: boolean
): { top: number; left: number; transform: string } {
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const tooltipWidth = Math.min(340, Math.max(0, viewportW - 32));
  const tooltipHeight = 232;
  const tooltipGap = 16;
  const viewportInset = 16;

  if (!spotlight || position === 'center') {
    return {
      top: Math.max(viewportInset, (viewportH - tooltipHeight) / 2),
      left: Math.max(viewportInset, (viewportW - tooltipWidth) / 2),
      transform: 'none',
    };
  }

  let top: number;
  let left: number;

  switch (position) {
    case 'bottom':
      top = spotlight.y + spotlight.height + tooltipGap;
      left = spotlight.x + spotlight.width / 2 - tooltipWidth / 2;
      break;
    case 'top':
      top = spotlight.y - tooltipGap - tooltipHeight;
      left = spotlight.x + spotlight.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = spotlight.y + spotlight.height / 2 - tooltipHeight / 2;
      left = isRtl ? spotlight.x - tooltipGap : spotlight.x - tooltipGap - tooltipWidth;
      break;
    case 'right':
      top = spotlight.y + spotlight.height / 2 - tooltipHeight / 2;
      left = isRtl
        ? spotlight.x + spotlight.width + tooltipGap - tooltipWidth
        : spotlight.x + spotlight.width + tooltipGap;
      break;
    default:
      top = Math.max(viewportInset, (viewportH - tooltipHeight) / 2);
      left = Math.max(viewportInset, (viewportW - tooltipWidth) / 2);
  }

  const maxLeft = Math.max(viewportInset, viewportW - tooltipWidth - viewportInset);
  left = Math.min(Math.max(left, viewportInset), maxLeft);

  const maxTop = Math.max(viewportInset, viewportH - tooltipHeight - viewportInset);
  if (top < viewportInset || top > maxTop) {
    const alternateTop =
      position === 'top'
        ? spotlight.y + spotlight.height + tooltipGap
        : spotlight.y - tooltipGap - tooltipHeight;
    top = Math.min(Math.max(alternateTop, viewportInset), maxTop);
  }

  return { top, left, transform: 'none' };
}

export function OnboardingTour() {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';

  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    transform: string;
  }>({ top: 0, left: 0, transform: 'translate(-50%, -50%)' });
  const rafRef = useRef<number>(0);
  const prevTargetRef = useRef<HTMLElement | null>(null);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startAttemptsRef = useRef(0);

  const step = ONBOARDING_STEPS[currentStep];
  const totalSteps = ONBOARDING_STEPS.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  // Update spotlight and tooltip positions, and make target elements visible
  const updatePositions = useCallback(() => {
    const stepData = ONBOARDING_STEPS[currentStep];
    if (!stepData) return;

    // Restore previous target's styles
    if (prevTargetRef.current) {
      prevTargetRef.current.style.removeProperty('opacity');
      prevTargetRef.current.style.removeProperty('pointer-events');
      prevTargetRef.current.classList.remove('onboarding-highlight');
    }

    // Find and highlight the current target element
    const targetEl = document.querySelector(stepData.targetSelector) as HTMLElement | null;
    if (targetEl) {
      // Make hidden elements (like heart buttons) visible during tour
      targetEl.style.opacity = '1';
      targetEl.style.pointerEvents = 'auto';
      targetEl.classList.add('onboarding-highlight');
      prevTargetRef.current = targetEl;
    }

    const rect = getSpotlightRect(stepData.targetSelector);
    setSpotlight(rect);

    if (rect) {
      const pos = getTooltipPosition(rect, stepData.position, isRtl);
      setTooltipPos(pos);
    } else {
      // Fallback to center if element not found
      setTooltipPos(getTooltipPosition(null, 'center', isRtl));
    }
  }, [currentStep, isRtl]);

  const cancelPendingStart = useCallback(() => {
    if (startTimerRef.current !== null) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
    startAttemptsRef.current = 0;
  }, []);

  const startWhenReady = useCallback(() => {
    cancelPendingStart();

    const attemptStart = () => {
      startTimerRef.current = null;
      if (!isWelcomeComplete() || isOnboardingComplete()) {
        setIsVisible(false);
        startAttemptsRef.current = 0;
        return;
      }

      const firstTarget = document.querySelector(ONBOARDING_STEPS[0].targetSelector);
      const firstTargetRect = firstTarget?.getBoundingClientRect();
      if (firstTargetRect && firstTargetRect.width > 0 && firstTargetRect.height > 0) {
        startAttemptsRef.current = 0;
        startTimerRef.current = null;
        setIsVisible(true);
        return;
      }

      if (startAttemptsRef.current >= 100) return;
      startAttemptsRef.current += 1;
      startTimerRef.current = setTimeout(attemptStart, 100);
    };

    attemptStart();
  }, [cancelPendingStart]);

  // Start only after the welcome screen is closed and the first target is mounted.
  useEffect(() => {
    const handleWelcomeCompleted = () => {
      startAttemptsRef.current = 0;
      startWhenReady();
    };

    window.addEventListener(WELCOME_COMPLETED_EVENT, handleWelcomeCompleted);

    if (isWelcomeComplete() && !isOnboardingComplete()) {
      startTimerRef.current = setTimeout(startWhenReady, 300);
    }

    return () => {
      window.removeEventListener(WELCOME_COMPLETED_EVENT, handleWelcomeCompleted);
      cancelPendingStart();
    };
  }, [cancelPendingStart, startWhenReady]);

  const restartTour = useCallback(() => {
    resetOnboarding();
    setCurrentStep(0);
    setIsVisible(false);
    cancelPendingStart();

    if (!isWelcomeComplete()) return;
    startAttemptsRef.current = 0;
    startWhenReady();
  }, [cancelPendingStart, startWhenReady]);

  // Listen for restart events and consume requests issued before this lazy
  // component mounted. Raw event dispatch remains a supported restart path.
  useEffect(() => {
    let isMounted = true;

    const handleRestart = () => {
      consumePendingOnboardingStart();
      restartTour();
    };

    window.addEventListener(ONBOARDING_START_EVENT, handleRestart);
    queueMicrotask(() => {
      if (isMounted && consumePendingOnboardingStart()) restartTour();
    });

    return () => {
      isMounted = false;
      window.removeEventListener(ONBOARDING_START_EVENT, handleRestart);
    };
  }, [restartTour]);

  // Update positions when step changes or visibility changes
  useEffect(() => {
    if (!isVisible) {
      // Restore previous target's styles when tour closes
      if (prevTargetRef.current) {
        prevTargetRef.current.style.removeProperty('opacity');
        prevTargetRef.current.style.removeProperty('pointer-events');
        prevTargetRef.current.classList.remove('onboarding-highlight');
        prevTargetRef.current = null;
      }
      return;
    }

    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    // Scroll the target into view before measuring the tooltip position.
    const timer = setTimeout(() => {
      const stepData = ONBOARDING_STEPS[currentStep];
      if (stepData && stepData.position !== 'center') {
        scrollTargetIntoView(stepData);
        settleTimer = setTimeout(updatePositions, 450);
      } else {
        updatePositions();
      }
    }, 100);

    // Update on resize/scroll
    const handleUpdate = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updatePositions);
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      clearTimeout(timer);
      if (settleTimer) clearTimeout(settleTimer);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep, isVisible, updatePositions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prevTargetRef.current) {
        prevTargetRef.current.style.removeProperty('opacity');
        prevTargetRef.current.style.removeProperty('pointer-events');
        prevTargetRef.current.classList.remove('onboarding-highlight');
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      markOnboardingComplete();
      setIsVisible(false);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLastStep]);

  const handlePrev = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [isFirstStep]);

  const handleSkip = useCallback(() => {
    markOnboardingComplete();
    setIsVisible(false);
  }, []);

  // Get localized step title and description
  const stepTitle = step ? (isRtl ? step.title.ar : step.title.en) : '';
  const stepDesc = step
    ? isRtl
      ? step.description.ar
      : step.description.en
    : '';

  // Spotlight clip path: rectangle cutout
  const clipPath = spotlight
    ? `polygon(
      0% 0%,
      0% 100%,
      ${spotlight.x}px 100%,
      ${spotlight.x}px ${spotlight.y}px,
      ${spotlight.x + spotlight.width}px ${spotlight.y}px,
      ${spotlight.x + spotlight.width}px ${spotlight.y + spotlight.height}px,
      ${spotlight.x}px ${spotlight.y + spotlight.height}px,
      ${spotlight.x}px 100%,
      100% 100%,
      100% 0%
    )`
    : 'none';

  // For center step (welcome), use full overlay without spotlight
  const isCenterStep = step?.position === 'center';

  return (
    <AnimatePresence>
      {isVisible && step && (
        <>
          {/* Overlay with spotlight cutout */}
          <motion.div
            key={`overlay-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100]"
            style={{
              backgroundColor: isCenterStep
                ? 'rgba(0, 0, 0, 0.6)'
                : 'rgba(0, 0, 0, 0.5)',
              clipPath: isCenterStep ? 'none' : clipPath,
              transition: 'clip-path 0.4s ease',
            }}
            onClick={handleSkip}
          />

          {/* Spotlight border ring */}
          {spotlight && !isCenterStep && (
            <motion.div
              key={`ring-${currentStep}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed z-[101] rounded-xl pointer-events-none"
              style={{
                top: spotlight.y,
                left: spotlight.x,
                width: spotlight.width,
                height: spotlight.height,
                boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.15)',
                transition: 'all 0.4s ease',
              }}
            />
          )}

          {/* Tooltip Card */}
          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 220 }}
            className="fixed z-[102] w-[340px] max-w-[calc(100vw-32px)] pointer-events-none"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: tooltipPos.transform,
            }}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            <div
              className="pointer-events-auto bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with step counter */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
                    <Sparkles className="size-3.5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('common.onboardingStep', {
                      current: currentStep + 1,
                      total: totalSteps,
                    })}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={handleSkip}
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRtl ? 16 : -16 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-2"
                >
                  <h3 className="text-lg font-bold text-foreground">
                    {stepTitle}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {stepDesc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Step indicator dots */}
              <div className="flex items-center justify-center gap-1.5 py-3">
                {ONBOARDING_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-6 h-2 bg-emerald-500'
                        : 'w-2 h-2 bg-muted-foreground/25 hover:bg-muted-foreground/40'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 bg-muted/20">
                {!isFirstStep ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className="gap-1 text-muted-foreground hover:text-foreground text-xs"
                  >
                    <ChevronLeft
                      className={`size-3.5 ${isRtl ? 'rotate-180' : ''}`}
                    />
                    {t('common.onboardingPrevious')}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    {t('common.onboardingSkip')}
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs rounded-lg"
                >
                  {isLastStep
                    ? t('common.onboardingComplete')
                    : t('common.onboardingNext')}
                  {!isLastStep && (
                    <ChevronRight
                      className={`size-3.5 ${isRtl ? 'rotate-180' : ''}`}
                    />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
