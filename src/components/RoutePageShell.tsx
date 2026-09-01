'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { useAppStore, type View, type Locale } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BackToTop } from '@/components/BackToTop';
import { FloatingControlDock } from '@/components/FloatingControlDock';
import { PageTransition } from '@/components/PageTransition';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { ThemeProvider, useTheme } from 'next-themes';
import { applyAccentColor, getSavedAccentColor } from '@/lib/accent-colors';
import { SsrLocaleContext, useSsrLocale } from '@/lib/ssr-locale';
import { useI18n } from '@/lib/i18n';
import { getCategoryBySlug, getToolById, localize } from '@/lib/tool-utils';

// ViewSkeleton for lazy-loaded views
function ViewSkeleton() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Lazy-loaded views
const HomeView = dynamic(() => import('@/components/views/HomeView').then(m => ({ default: m.HomeView })), {
  ssr: false,
  loading: () => <ViewSkeleton />,
});
const CategoryView = dynamic(() => import('@/components/views/CategoryView').then(m => ({ default: m.CategoryView })), {
  ssr: false,
  loading: () => <ViewSkeleton />,
});
const ToolView = dynamic(() => import('@/components/views/ToolView').then(m => ({ default: m.ToolView })), {
  ssr: false,
  loading: () => <ViewSkeleton />,
});
const AllToolsView = dynamic(() => import('@/components/views/AllToolsView').then(m => ({ default: m.AllToolsView })), {
  ssr: false,
  loading: () => <ViewSkeleton />,
});
const FavoritesView = dynamic(() => import('@/components/views/FavoritesView').then(m => ({ default: m.FavoritesView })), {
  ssr: false,
  loading: () => <ViewSkeleton />,
});
const CategoriesView = dynamic(() => import('@/components/views/CategoriesView').then(m => ({ default: m.CategoriesView })), {
  ssr: false,
  loading: () => <ViewSkeleton />,
});

// Lazy-loaded heavy feature components
const CommandPalette = dynamic(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })), { ssr: false });
const CompareTools = dynamic(() => import('@/components/CompareTools').then(m => ({ default: m.CompareTools })), { ssr: false });
const OnboardingTour = dynamic(() => import('@/components/OnboardingTour').then(m => ({ default: m.OnboardingTour })), { ssr: false });
const SettingsPanel = dynamic(() => import('@/components/SettingsPanel').then(m => ({ default: m.SettingsPanel })), { ssr: false });
const WelcomeOverlay = dynamic(() => import('@/components/WelcomeOverlay').then(m => ({ default: m.WelcomeOverlay })), { ssr: false });
const KeyboardShortcutsPanel = dynamic(() => import('@/components/KeyboardShortcutsPanel').then(m => ({ default: m.KeyboardShortcutsPanel })), { ssr: false });
const FloatingActionButton = dynamic(() => import('@/components/FloatingActionButton').then(m => ({ default: m.FloatingActionButton })), { ssr: false });
const QuickAccessBar = dynamic(() => import('@/components/QuickAccessBar').then(m => ({ default: m.QuickAccessBar })), { ssr: false });
const ShortcutHelpFab = dynamic(() => import('@/components/ShortcutHelpFab').then(m => ({ default: m.ShortcutHelpFab })), { ssr: false });

interface RoutePageShellProps {
  initialView?: View;
  initialToolId?: string;
  initialCategorySlug?: string;
  initialLocale?: string;
}

function RoutePageContent({ initialView = 'home', initialToolId, initialCategorySlug, initialLocale }: RoutePageShellProps) {
  const currentView = useAppStore((state) => state.currentView);
  const selectedTool = useAppStore((state) => state.selectedTool);
  const selectedCategory = useAppStore((state) => state.selectedCategory);
  const storeLocale = useAppStore((state) => state.locale);
  const ssrLocale = useSsrLocale();
  const locale = ssrLocale ?? storeLocale;
  const hydrateLocale = useAppStore((state) => state.hydrateLocale);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const navigateToTool = useAppStore((state) => state.navigateToTool);
  const navigateHome = useAppStore((state) => state.navigateHome);
  const initFromProps = useAppStore((state) => state.initFromProps);
  const initFromURL = useAppStore((state) => state.initFromURL);
  const setLocale = useAppStore((state) => state.setLocale);

  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useI18n();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareInitialTool, setCompareInitialTool] = useState<string | undefined>(undefined);
  // F3: polite live region message for SPA route announcements. Lives in the
  // shell (not inside a swapped view) so it stays mounted across transitions.
  const [liveMessage, setLiveMessage] = useState('');

  const gPrefixRef = useRef(false);
  const gPrefixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // F3: focus-management + announcement tracking for SPA route changes.
  const prevRouteIdentityRef = useRef<string | null>(null);
  const routeReadyRef = useRef(false);
  const focusRafRef = useRef<number | null>(null);
  const announceRafRef = useRef<number | null>(null);

  // Synchronously set locale from server before first render
  // This ensures SSR renders with the correct locale (not default 'en')
  const ssrLocaleRef = useRef(false);
  if (!ssrLocaleRef.current && initialLocale && (initialLocale === 'ar' || initialLocale === 'en')) {
    const currentStoreLocale = useAppStore.getState().locale;
    if (currentStoreLocale !== initialLocale) {
      useAppStore.setState({ locale: initialLocale as 'ar' | 'en' });
    }
    ssrLocaleRef.current = true;
  }

  // Hide server-rendered SEO content after hydration
  // Using display:none instead of .remove() to avoid React removeChild errors
  useEffect(() => {
    const seoEl = document.getElementById('seo-content');
    if (seoEl) seoEl.style.display = 'none';
  }, []);

  // Hydrate locale from localStorage after mount
  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);

  // Locale is now set synchronously above before first render
  // This useEffect is kept as a safety net for any edge cases
  useEffect(() => {
    if (initialLocale && (initialLocale === 'ar' || initialLocale === 'en')) {
      const currentStoreLocale = useAppStore.getState().locale;
      if (currentStoreLocale !== initialLocale) {
        useAppStore.setState({ locale: initialLocale as 'ar' | 'en' });
      }
    }
  }, [initialLocale]);

  // Initialize navigation from server component props
  useEffect(() => {
    initFromProps(initialView, initialToolId, initialCategorySlug);
  }, [initialView, initialToolId, initialCategorySlug, initFromProps]);

  // Listen for browser back/forward
  useEffect(() => {
    function handlePopState() {
      initFromURL();
      const pathLocale = window.location.pathname.split('/')[1];
      if (pathLocale === 'ar' || pathLocale === 'en') {
        setLocale(pathLocale as 'ar' | 'en');
      }
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [initFromURL, setLocale]);

  // F3: Localized destination label for the active SPA route. Reuses existing
  // localized names (header/home/common) and the tool/category names so EN and
  // AR stay aligned without hard-coded single-locale text.
  const routeAnnouncement = useMemo(() => {
    let viewLabel: string;
    switch (currentView) {
      case 'categories':
        viewLabel = t('home.allCategories');
        break;
      case 'category': {
        const category = selectedCategory ? getCategoryBySlug(selectedCategory) : undefined;
        viewLabel = category ? localize(category.name, locale) : t('header.categories');
        break;
      }
      case 'tool': {
        const tool = selectedTool ? getToolById(selectedTool) : undefined;
        viewLabel = tool ? localize(tool.name, locale) : t('header.allTools');
        break;
      }
      case 'all-tools':
        viewLabel = t('header.allTools');
        break;
      case 'favorites':
        viewLabel = t('common.favorites');
        break;
      case 'home':
      default:
        viewLabel = t('header.home');
        break;
    }
    return t('a11y.navigatedTo', { view: viewLabel });
  }, [currentView, selectedCategory, selectedTool, locale, t]);

  // F3: A route identity derived from currentView + selected tool/category is
  // safer than currentView alone because two different tools share the 'tool'
  // view family and two categories share the 'category' family.
  const routeIdentity = `${currentView}|${selectedTool ?? ''}|${selectedCategory ?? ''}`;

  // F3: Move focus to the stable main target and announce the new route after a
  // completed SPA view change (pushState or popstate). The initial route
  // (hydration + initFromProps/URL) is recorded as a baseline and never steals
  // focus; only subsequent identity changes move focus and re-announce. All
  // browser access stays inside effects + animation frames so the new view has
  // settled and identical consecutive destinations still re-fire the region.
  useEffect(() => {
    if (!isHydrated) {
      // Still on the transient default route during hydration: never focus.
      prevRouteIdentityRef.current = null;
      routeReadyRef.current = false;
      return;
    }
    if (!routeReadyRef.current) {
      // First hydrated route = the initial route established by props/URL.
      prevRouteIdentityRef.current = routeIdentity;
      routeReadyRef.current = true;
      return;
    }
    if (routeIdentity === prevRouteIdentityRef.current) {
      // Unrelated state (favorites/search/filter) does not change identity.
      return;
    }
    prevRouteIdentityRef.current = routeIdentity;

    const message = routeAnnouncement;
    focusRafRef.current = requestAnimationFrame(() => {
      focusRafRef.current = null;
      const mainEl = document.getElementById('main-content');
      if (mainEl instanceof HTMLElement) {
        mainEl.focus();
      }
      // Clear before reannouncing so an identical consecutive destination
      // still re-fires the polite live region.
      setLiveMessage('');
      announceRafRef.current = requestAnimationFrame(() => {
        announceRafRef.current = null;
        setLiveMessage(message);
      });
    });

    return () => {
      if (focusRafRef.current !== null) {
        cancelAnimationFrame(focusRafRef.current);
        focusRafRef.current = null;
      }
      if (announceRafRef.current !== null) {
        cancelAnimationFrame(announceRafRef.current);
        announceRafRef.current = null;
      }
    };
  }, [routeIdentity, isHydrated, routeAnnouncement]);

  // Apply saved accent color
  useEffect(() => {
    const saved = getSavedAccentColor();
    if (saved) {
      applyAccentColor(saved);
    }
  }, []);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed - silent fail
      });
    }
  }, []);

  // Set HTML dir and lang based on locale
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  // Listen for settings open event
  useEffect(() => {
    function handleSettingsEvent() {
      setSettingsOpen(true);
    }
    window.addEventListener('quickshed-settings', handleSettingsEvent);
    return () => window.removeEventListener('quickshed-settings', handleSettingsEvent);
  }, []);

  // Listen for compare tools event
  useEffect(() => {
    function handleCompareEvent(e: Event) {
      const toolId = (e as CustomEvent).detail?.toolId as string | undefined;
      setCompareInitialTool(toolId);
      setCompareOpen(true);
    }
    window.addEventListener('quickshed-compare', handleCompareEvent);
    return () => window.removeEventListener('quickshed-compare', handleCompareEvent);
  }, []);

  // Helper to check if user is typing in an input
  const isTyping = useCallback((e: KeyboardEvent) => {
    return (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      (e.target as HTMLElement)?.isContentEditable
    );
  }, []);

  // Global keyboard listeners
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // "?" key to open shortcuts panel
      if (e.key === '?' && !isTyping(e)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('quickshed-keyboard-shortcuts'));
        return;
      }

      // "d" key to toggle dark mode
      if (e.key === 'd' && !isTyping(e) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
        return;
      }

      // "t" key to navigate to last used tool
      if (e.key === 't' && !isTyping(e) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const lastTool = useAppStore.getState().recentTools[0];
        if (lastTool) {
          e.preventDefault();
          navigateToTool(lastTool);
        }
        return;
      }

      // "g" key - start of vim-style sequence
      if (e.key === 'g' && !isTyping(e) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (gPrefixRef.current) {
          // Double 'g' - ignore (not mapped)
          gPrefixRef.current = false;
          if (gPrefixTimerRef.current) clearTimeout(gPrefixTimerRef.current);
          return;
        }
        // First 'g' - wait for next key
        gPrefixRef.current = true;
        gPrefixTimerRef.current = setTimeout(() => {
          gPrefixRef.current = false;
        }, 1000);
        return;
      }

      // "h" key after "g" - go home (vim-style gh)
      if (e.key === 'h' && !isTyping(e) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (gPrefixRef.current) {
          e.preventDefault();
          gPrefixRef.current = false;
          if (gPrefixTimerRef.current) clearTimeout(gPrefixTimerRef.current);
          navigateHome();
          return;
        }
      }

      // Any other key resets the 'g' prefix
      if (gPrefixRef.current && e.key !== 'g') {
        gPrefixRef.current = false;
        if (gPrefixTimerRef.current) clearTimeout(gPrefixTimerRef.current);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (gPrefixTimerRef.current) clearTimeout(gPrefixTimerRef.current);
    };
  }, [isTyping, setTheme, resolvedTheme, navigateToTool, navigateHome]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <a href="#main-content" className="spa-skip-link">
        {t('a11y.skipToMain')}
      </a>
      <div
        data-testid="route-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveMessage}
      </div>
      <AnnouncementBanner onVisibilityChange={setBannerVisible} />
      <Header announcementVisible={bannerVisible} />
      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 transition-[padding-top] duration-300 ease-in-out ${bannerVisible ? 'pt-[184px] md:pt-[132px]' : 'pt-[114px] md:pt-16'}`}
      >
        {!isHydrated ? (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-muted-foreground text-sm">Loading QuickShed...</p>
            </div>
          </div>
        ) : (
          <PageTransition>
            {currentView === 'home' && <HomeView />}
            {currentView === 'categories' && <CategoriesView />}
            {currentView === 'category' && <CategoryView />}
            {currentView === 'tool' && <ToolView />}
            {currentView === 'all-tools' && <AllToolsView />}
            {currentView === 'favorites' && <FavoritesView />}
          </PageTransition>
        )}
      </main>
      <Footer />
      <FloatingControlDock>
        <ShortcutHelpFab />
        <BackToTop />
        <FloatingActionButton />
      </FloatingControlDock>
      <KeyboardShortcutsPanel />
      <QuickAccessBar />
      <ThemeCustomizer />
      {currentView === 'home' && <OnboardingTour />}
      <CommandPalette />
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CompareTools open={compareOpen} onOpenChange={setCompareOpen} initialToolId={compareInitialTool} />
      {currentView === 'home' && <WelcomeOverlay />}
    </div>
  );
}

export default function RoutePageShell(props: RoutePageShellProps) {
  const ssrLocale = (props.initialLocale === 'ar' || props.initialLocale === 'en')
    ? (props.initialLocale as Locale)
    : null;

  return (
    <SsrLocaleContext.Provider value={ssrLocale}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RoutePageContent {...props} />
      </ThemeProvider>
    </SsrLocaleContext.Provider>
  );
}
