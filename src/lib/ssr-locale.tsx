'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './store';

/**
 * Context for providing the server-determined locale to client components.
 * This ensures Footer/Header render with the correct locale during SSR,
 * before the Zustand store hydrates from localStorage.
 */
export const SsrLocaleContext = createContext<Locale | null>(null);

/**
 * Hook to get the SSR-determined locale.
 * Returns the locale from context if available (set by server component),
 * otherwise returns null (meaning the Zustand store locale should be used).
 */
export function useSsrLocale(): Locale | null {
  return useContext(SsrLocaleContext);
}
