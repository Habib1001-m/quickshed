/** Site URL from environment variable */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://quickshed.vercel.app';
export const REPOSITORY_URL = 'https://github.com/Habib1001-m/quickshed';

/** Supported locales */
export const LOCALES = ['en', 'ar'] as const;
export type AppLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'en';
