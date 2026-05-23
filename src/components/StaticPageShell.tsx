'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { SsrLocaleContext } from '@/lib/ssr-locale';
import type { Locale } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BackToTop } from '@/components/BackToTop';

interface BlogPageShellProps {
  locale: string;
  children: React.ReactNode;
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
      originalPushState(...args);
      // pushState was called — do a full navigation to the new URL
      const newUrl = args[2];
      if (typeof newUrl === 'string' && newUrl !== window.location.pathname) {
        window.location.href = newUrl;
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
        <div className="min-h-screen flex flex-col bg-background text-foreground" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <Header />
          <main className="flex-1 pt-16">
            {children}
          </main>
          <Footer />
          <BackToTop />
        </div>
      </ThemeProvider>
    </SsrLocaleContext.Provider>
  );
}
