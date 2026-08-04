'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { SsrLocaleContext } from '@/lib/ssr-locale';
import { useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BackToTop } from '@/components/BackToTop';

interface BlogPageShellProps {
  locale: string;
  children: React.ReactNode;
}

function StaticPageContent({ locale, children }: BlogPageShellProps) {
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <a href="#main-content" className="spa-skip-link">
        {t('a11y.skipToMain')}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

/**
 * Shell for non-SPA pages (blog, privacy, terms, etc.).
 *
 * The main app uses a single-page architecture where the Header navigates
 * via Zustand store + pushState. On non-SPA pages we need full page
 * navigation when the user clicks Header links. We achieve this by
 * intercepting pushState and doing a full page load to the target URL.
 */
export default function StaticPageShell({ locale, children }: BlogPageShellProps) {
  const ssrLocale = (locale === 'ar' || locale === 'en') ? (locale as Locale) : null;

  // Intercept pushState from Header navigation (Home, Categories, etc.)
  // and convert it to full page navigation, since we're not in the SPA shell.
  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);

    window.history.pushState = function (...args) {
      const currentPathname = window.location.pathname;
      const newUrl = args[2];
      const targetUrl = typeof newUrl === 'string'
        ? new URL(newUrl, window.location.href)
        : null;

      originalPushState(...args);

      // pushState was called — do a full navigation to a different same-origin path.
      if (
        typeof newUrl === 'string' &&
        targetUrl &&
        targetUrl.origin === window.location.origin &&
        targetUrl.pathname !== currentPathname
      ) {
        window.location.assign(newUrl);
      }
    };

    return () => {
      // Restore original pushState on unmount
      window.history.pushState = originalPushState;
    };
  }, []);

  return (
    <SsrLocaleContext.Provider value={ssrLocale}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <StaticPageContent locale={locale}>{children}</StaticPageContent>
      </ThemeProvider>
    </SsrLocaleContext.Provider>
  );
}
