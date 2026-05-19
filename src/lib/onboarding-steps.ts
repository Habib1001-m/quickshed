/**
 * Onboarding tour step definitions and helper functions.
 * Uses CSS selectors with data-onboarding attributes to target elements.
 */

export interface OnboardingStep {
  id: string;
  targetSelector: string; // CSS selector for the element to highlight
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'; // tooltip position relative to target
}

const ONBOARDING_STORAGE_KEY = 'quickshed-onboarding-complete';

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    targetSelector: '[data-onboarding="welcome"]',
    title: {
      en: 'Welcome to QuickShed!',
      ar: 'مرحباً بك في كويك شيد!',
    },
    description: {
      en: 'Your privacy-first toolbox with 90+ free tools that run entirely in your browser.',
      ar: 'مجموعة أدواتك الخاصة بالخصوصية مع أكثر من 90 أداة مجانية تعمل بالكامل في متصفحك.',
    },
    position: 'center',
  },
  {
    id: 'search',
    targetSelector: '[data-onboarding="search"]',
    title: {
      en: 'Smart Search',
      ar: 'بحث ذكي',
    },
    description: {
      en: "Find any tool instantly with our smart search. Try searching for 'password' or 'color'.",
      ar: "ابحث عن أي أداة فوراً مع بحثنا الذكي. جرّب البحث عن 'كلمة مرور' أو 'لون'.",
    },
    position: 'bottom',
  },
  {
    id: 'categories',
    targetSelector: '[data-onboarding="categories"]',
    title: {
      en: 'Browse Categories',
      ar: 'تصفح الفئات',
    },
    description: {
      en: 'Browse 11 categories from calculators to developer tools.',
      ar: 'تصفح 11 فئة من الآلات الحاسبة إلى أدوات المطور.',
    },
    position: 'top',
  },
  {
    id: 'privacy',
    targetSelector: '[data-onboarding="privacy"]',
    title: {
      en: 'Privacy Badges',
      ar: 'شارات الخصوصية',
    },
    description: {
      en: '🟢 Local tools run 100% in your browser. 🟠 API tools need a connection.',
      ar: '🟢 الأدوات المحلية تعمل 100% في متصفحك. 🟠 أدوات API تحتاج اتصالاً.',
    },
    position: 'bottom',
  },
  {
    id: 'favorites',
    targetSelector: '[data-onboarding="favorites"]',
    title: {
      en: 'Favorites & Collections',
      ar: 'المفضلة والمجموعات',
    },
    description: {
      en: 'Save your favorite tools and organize them into collections.',
      ar: 'احفظ أدواتك المفضلة ونظمها في مجموعات.',
    },
    position: 'bottom',
  },
];

/**
 * Check if the onboarding tour has been completed.
 */
export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark the onboarding tour as completed.
 */
export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch {
    // localStorage not available
  }
}

/**
 * Reset the onboarding tour so it shows again on next visit.
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  } catch {
    // localStorage not available
  }
}
