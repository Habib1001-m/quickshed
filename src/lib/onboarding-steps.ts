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

export const WELCOME_STORAGE_KEY = 'quickshed-welcomed';
export const WELCOME_COMPLETED_EVENT = 'quickshed-welcome-completed';
export const ONBOARDING_START_EVENT = 'quickshed-start-onboarding';

let pendingOnboardingStart = false;

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
      en: 'Each tool shows its data-handling category. Local tools process data in your browser; other badges explain file, browser-storage, or external-service handling.',
      ar: 'توضح كل أداة فئة تعاملها مع البيانات. تعالج الأدوات المحلية البيانات في متصفحك، وتوضح الشارات الأخرى التعامل مع الملفات أو تخزين المتصفح أو الخدمات الخارجية.',
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
    targetSelector: '[data-onboarding="categories-heading"]',
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
      en: 'Privacy badges: 🟢 Local runs in your browser; 🔵 File-only processes the file you open; 🟣 On-device saves data to your browser; 🟠 API uses an external service.',
      ar: 'شارات الخصوصية: 🟢 محلي يعمل في متصفحك؛ 🔵 داخل الملف يعالج الملف الذي تفتحه؛ 🟣 على الجهاز يحفظ البيانات في متصفحك؛ 🟠 API يستخدم خدمة خارجية.',
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
 * Check whether the Welcome overlay has been completed.
 *
 * Only the canonical string value counts, and browser storage is unavailable
 * during SSR or in some browser contexts.
 */
export function isWelcomeComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(WELCOME_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark Welcome complete and notify any mounted onboarding stages.
 */
export function markWelcomeComplete(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window.localStorage;
    storage.setItem(WELCOME_STORAGE_KEY, 'true');
    if (storage.getItem(WELCOME_STORAGE_KEY) !== 'true') return false;
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(WELCOME_COMPLETED_EVENT));
  return true;
}

/**
 * Request a tour restart and retain it until a mounted tour consumes it.
 */
export function requestOnboardingStart(): void {
  if (typeof window === 'undefined') return;
  pendingOnboardingStart = true;
  window.dispatchEvent(new CustomEvent(ONBOARDING_START_EVENT));
}

/**
 * Consume one pending restart request without persisting it.
 */
export function consumePendingOnboardingStart(): boolean {
  const hasPendingStart = pendingOnboardingStart;
  pendingOnboardingStart = false;
  return hasPendingStart;
}

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
