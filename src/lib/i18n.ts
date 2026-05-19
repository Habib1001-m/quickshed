'use client';

import { useMemo } from 'react';
import { useAppStore, type Locale } from './store';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';

type TranslationData = typeof en;

const translations: Record<Locale, TranslationData> = { en, ar };

/**
 * Resolve a dot-notation key from a nested object.
 * Example: getNestedValue(obj, 'home.heroTitle') => obj.home.heroTitle
 */
function getNestedValue(obj: Record<string, unknown>, key: string): string | undefined {
  const keys = key.split('.');
  let current: unknown = obj;
  for (const k of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[k];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate values into a string.
 * Example: interpolate("{count} tools", { count: 5 }) => "5 tools"
 */
function interpolate(
  template: string,
  params?: Record<string, string | number>
): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template
  );
}

export type TranslateFn = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Custom hook that provides a translation function `t()` based on the current locale.
 *
 * Usage:
 * ```tsx
 * const { t } = useI18n();
 * return <h1>{t('home.heroTitle')}</h1>;
 * // With interpolation:
 * return <span>{t('category.toolsInCategory', { count: 5 })}</span>
 * ```
 */
export function useI18n(): { t: TranslateFn; locale: Locale } {
  const locale = useAppStore((state) => state.locale);

  const t = useMemo<TranslateFn>(() => {
    const messages = translations[locale];
    return (key: string, params?: Record<string, string | number>) => {
      const value = getNestedValue(messages as unknown as Record<string, unknown>, key);
      if (value === undefined) {
        // Fallback to English if key not found in current locale
        const fallback = getNestedValue(
          translations.en as unknown as Record<string, unknown>,
          key
        );
        if (fallback === undefined) {
          console.warn(`[i18n] Missing translation key: ${key}`);
          return key;
        }
        return interpolate(fallback, params);
      }
      return interpolate(value, params);
    };
  }, [locale]);

  return { t, locale };
}

/**
 * Non-hook version for use outside React components.
 * Returns a translation function for the given locale.
 */
export function createTranslator(locale: Locale): TranslateFn {
  const messages = translations[locale];
  return (key: string, params?: Record<string, string | number>) => {
    const value = getNestedValue(messages as unknown as Record<string, unknown>, key);
    if (value === undefined) {
      const fallback = getNestedValue(
        translations.en as unknown as Record<string, unknown>,
        key
      );
      if (fallback === undefined) {
        console.warn(`[i18n] Missing translation key: ${key}`);
        return key;
      }
      return interpolate(fallback, params);
    }
    return interpolate(value, params);
  };
}
