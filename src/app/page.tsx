'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnnouncementBanner } from '@/components/AnnouncementBanner';
import { useAppStore } from '@/lib/store';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { HomeView } from '@/components/views/HomeView';
import { CategoryView } from '@/components/views/CategoryView';
import { ToolView } from '@/components/views/ToolView';
import { AllToolsView } from '@/components/views/AllToolsView';
import { FavoritesView } from '@/components/views/FavoritesView';
import { BackToTop } from '@/components/BackToTop';
import { CommandPalette } from '@/components/CommandPalette';
import { PageTransition } from '@/components/PageTransition';
import { SettingsPanel } from '@/components/SettingsPanel';
import { WelcomeOverlay } from '@/components/WelcomeOverlay';
import { CompareTools } from '@/components/CompareTools';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { KeyboardShortcutsPanel } from '@/components/KeyboardShortcutsPanel';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { OnboardingTour } from '@/components/OnboardingTour';
import { QuickAccessBar } from '@/components/QuickAccessBar';
import { ShortcutHelpFab } from '@/components/ShortcutHelpFab';
import { ThemeProvider, useTheme } from 'next-themes';
import { applyAccentColor, getSavedAccentColor } from '@/lib/accent-colors';

function AppContent() {
  const currentView = useAppStore((state) => state.currentView);
  const locale = useAppStore((state) => state.locale);
  const hydrateLocale = useAppStore((state) => state.hydrateLocale);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const recentTools = useAppStore((state) => state.recentTools);
  const navigateToTool = useAppStore((state) => state.navigateToTool);
  const navigateHome = useAppStore((state) => state.navigateHome);

  const { setTheme, resolvedTheme } = useTheme();

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Banner visibility state
  const [bannerVisible, setBannerVisible] = useState(false);

  // Compare tools dialog state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareInitialTool, setCompareInitialTool] = useState<string | undefined>(undefined);

  // Vim-style 'g' prefix state
  const gPrefixRef = useRef(false);
  const gPrefixTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate locale from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    hydrateLocale();
  }, [hydrateLocale]);

  // Apply saved accent color on mount
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

  // Set HTML dir and lang attributes based on locale
  useEffect(() => {
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  // Listen for settings open event from Header
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
      <AnnouncementBanner onVisibilityChange={setBannerVisible} />
      <Header />
      <main className={`flex-1 ${bannerVisible ? 'pt-[88px]' : 'pt-16'}`}>
        {/* Only render content after hydration to prevent flash */}
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
            {currentView === 'category' && <CategoryView />}
            {currentView === 'tool' && <ToolView />}
            {currentView === 'all-tools' && <AllToolsView />}
            {currentView === 'favorites' && <FavoritesView />}
          </PageTransition>
        )}
      </main>
      <Footer />
      <BackToTop />
      <FloatingActionButton />
      <KeyboardShortcutsPanel />
      <ShortcutHelpFab />
      <QuickAccessBar />
      <ThemeCustomizer />
      <OnboardingTour />
      <CommandPalette />
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <CompareTools open={compareOpen} onOpenChange={setCompareOpen} initialToolId={compareInitialTool} />
      <WelcomeOverlay />
    </div>
  );
}

export default function QuickShedApp() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}
