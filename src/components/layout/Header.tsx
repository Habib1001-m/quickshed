'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import Fuse from 'fuse.js';
import {
  Search,
  Sun,
  Moon,
  Menu,
  Globe,
  Settings,
  Home,
  Wrench,
  Calculator,
  Clock,
  Type,
  ArrowLeftRight,
  GraduationCap,
  FileText,
  Shield,
  Code,
  Image,
  KeyRound,
  TrendingUp,
  PenTool,
  Link,
  ArrowDownUp,
  ScissorsLineDashed,
  CalendarPlus,
  Bell,
  Gauge,
  MoveHorizontal,
  ShieldCheck,
  Key,
  Layers,
  Binary,
  Dice5,
  Radio,
  FileCode,
  Hash,
  Bot,
  Timer,
  Scissors,
  Code2,
  Banknote,
  Briefcase,
  CaseSensitive,
  TimerReset,
  Database,
  Fuel,
  StickyNote,
  Merge,
  BookOpenCheck,
  ArrowRightLeft,
  Activity,
  Tag,
  Move,
  Globe as GlobeIcon,
  Hourglass,
  Smile,
  Percent,
  FileCode2,
  Wallet,
  Thermometer,
  GitCompare,
  ListMinus,
  SearchCheck,
  LinkIcon,
  Lock,
  Paintbrush,
  Heart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore, type Locale } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getAllTools, getCategoryName, localize, getCategories } from '@/lib/tool-utils';
import type { ToolDescriptor } from '@/lib/tool-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

// ─── Icon Map: string name -> Lucide component ──────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Calculator,
  Clock,
  Type,
  ArrowLeftRight,
  GraduationCap,
  FileText,
  Wrench,
  Search,
  Code,
  Image,
  Shield,
  KeyRound,
  TrendingUp,
  PenTool,
  Link,
  ArrowDownUp,
  ScissorsLineDashed,
  CalendarPlus,
  Bell,
  Gauge,
  MoveHorizontal,
  ShieldCheck,
  Key,
  Layers,
  Binary,
  Dice5,
  Radio,
  FileCode,
  Hash,
  Bot,
  Timer,
  Scissors,
  Code2,
  Banknote,
  Briefcase,
  CaseSensitive,
  Tomato: TimerReset,
  Database,
  Fuel,
  StickyNote,
  Merge,
  BookOpenCheck,
  ArrowRightLeft,
  Activity,
  Tag,
  Move,
  Globe: GlobeIcon,
  Hourglass,
  Smile,
  Percent,
  FileCode2,
  Wallet,
  Thermometer,
  GitCompare,
  ListMinus,
  SearchCheck,
  LinkIcon,
  Lock,
};

function getToolIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Wrench;
}

// ─── Search Result Item ─────────────────────────────────────────────

interface SearchResultItem {
  tool: ToolDescriptor;
  refIndex: number;
}

// ─── Header Component ───────────────────────────────────────────────

export default function Header() {
  const { t, locale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const navigateHome = useAppStore((s) => s.navigateHome);
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);
  const navigateToFavorites = useAppStore((s) => s.navigateToFavorites);
  const favorites = useAppStore((s) => s.favorites);
  const setLocale = useAppStore((s) => s.setLocale);

  const isRTL = locale === 'ar';

  // Detect macOS for keyboard shortcut badge
  const [isMac] = useState(() => {
    if (typeof navigator === 'undefined') return false;
    return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);

  // All tools for Fuse
  const allTools = useMemo(() => getAllTools(), []);

  // Fuse.js instance
  const fuse = useMemo(
    () =>
      new Fuse(allTools, {
        keys: [
          { name: 'name.en', weight: 2 },
          { name: 'name.ar', weight: 2 },
          { name: 'keywords', weight: 1.5 },
          { name: 'category', weight: 1 },
          { name: 'description.en', weight: 0.5 },
          { name: 'description.ar', weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [allTools]
  );

  // Debounced search
  const handleSearchInput = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setSelectedIndex(-1);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value.trim()) {
        setSearchResults([]);
        setIsSearchOpen(false);
        return;
      }

      debounceRef.current = setTimeout(() => {
        const results = fuse.search(value, { limit: 8 });
        setSearchResults(
          results.map((r) => ({ tool: r.item, refIndex: r.refIndex }))
        );
        setIsSearchOpen(true);
      }, 150);
    },
    [fuse]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation in search
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isSearchOpen || searchResults.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          navigateToTool(searchResults[selectedIndex].tool.id);
          setSearchQuery('');
          setSearchResults([]);
          setIsSearchOpen(false);
          setSelectedIndex(-1);
          searchInputRef.current?.blur();
        }
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
      }
    },
    [isSearchOpen, searchResults, selectedIndex, navigateToTool]
  );

  // Click on a search result
  const handleResultClick = useCallback(
    (toolId: string) => {
      navigateToTool(toolId);
      setSearchQuery('');
      setSearchResults([]);
      setIsSearchOpen(false);
      setSelectedIndex(-1);
    },
    [navigateToTool]
  );

  // Theme toggle
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // Language toggle
  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  // Categories for mobile menu
  const categories = useMemo(() => getCategories(), []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 glass-strong ${
        isRTL ? 'rtl' : 'ltr'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={navigateHome}
          className="flex items-center gap-2 shrink-0 group transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1 glow-focus hover:shadow-lg hover:shadow-emerald-500/20"
          aria-label={t('header.home')}
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500 text-white">
            <Wrench className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            {t('site.name')}
          </span>
        </button>

        {/* Search Bar (desktop only) */}
        <div className="hidden md:flex relative flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              onKeyDown={handleSearchKeyDown}
              className="ps-9 pe-14 h-10 w-full glass-input bg-muted/50 border-border/50 focus:border-emerald-500 focus:ring-emerald-500/20 placeholder:text-muted-foreground/70"
            />
            {/* Keyboard shortcut badge */}
            <kbd className="absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex items-center gap-0.5 rounded border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] font-semibold text-foreground/50 dark:text-foreground/40">
              {isMac ? '⌘' : 'Ctrl'}K
            </kbd>

            {/* Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div
                ref={searchDropdownRef}
                className="absolute top-full mt-1 inset-x-0 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
              >
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.map((result, index) => {
                    const Icon = getToolIcon(result.tool.icon);
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={result.tool.id}
                        onClick={() => handleResultClick(result.tool.id)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-start transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/10 text-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-md shrink-0 ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {localize(result.tool.name, locale)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {getCategoryName(result.tool.category, locale)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            result.tool.privacy === 'local'
                              ? 'secondary'
                              : 'outline'
                          }
                          className="shrink-0 text-[10px] px-1.5 py-0"
                        >
                          {result.tool.privacy === 'local'
                            ? t('tool.privacyLocalShort')
                            : t('tool.privacyApiShort')}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  {t('search.searchBy')}
                </div>
              </div>
            )}

            {/* No Results */}
            {isSearchOpen && searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full mt-1 inset-x-0 bg-popover border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
                {t('search.noResults')}
              </div>
            )}
          </div>
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Favorites Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-3 text-sm font-medium rounded-full bg-muted/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 micro-bounce relative"
            onClick={navigateToFavorites}
            aria-label={t('common.favorites')}
          >
            <Heart className="h-4 w-4 text-red-500" />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold shadow-sm">
                {favorites.length > 9 ? '9+' : favorites.length}
              </span>
            )}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 micro-bounce"
            onClick={toggleTheme}
            aria-label={t('header.themeToggle')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 px-3 text-sm font-medium rounded-full bg-muted/50 hover:bg-muted transition-all duration-200 micro-bounce"
            onClick={toggleLocale}
            aria-label={t('header.languageSwitch')}
          >
            <Globe className="h-4 w-4" />
            <span>
              {t('header.languageSwitch')}
            </span>
          </Button>

          {/* Theme Customizer Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 micro-bounce"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('quickshed-theme-customizer'));
            }}
            aria-label={t('common.themeCustomizer')}
          >
            <Paintbrush className="h-4 w-4" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 micro-bounce"
            onClick={() => {
              // Dispatch custom event for settings panel
              window.dispatchEvent(new CustomEvent('quickshed-settings'));
            }}
            aria-label={t('common.settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label={t('header.mobileMenu')}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={isRTL ? 'right' : 'left'}
              className="w-72 bg-background"
            >
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-7 w-7 rounded-md bg-emerald-500 text-white">
                    <Wrench className="h-3.5 w-3.5" />
                  </div>
                  {t('site.name')}
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Search */}
              <div className="px-4 pb-3">
                <div className="relative">
                  <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
                  <Input
                    type="text"
                    placeholder={t('header.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults.length > 0) {
                        handleResultClick(searchResults[0].tool.id);
                        setMobileOpen(false);
                      }
                    }}
                    className="ps-9 pe-4 h-9 w-full glass-input bg-muted/50 border-border/50"
                  />
                </div>
                {/* Mobile Search Results */}
                {searchQuery.trim() && searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-border bg-popover">
                    {searchResults.slice(0, 5).map((result) => {
                      const Icon = getToolIcon(result.tool.icon);
                      return (
                        <button
                          key={result.tool.id}
                          onClick={() => {
                            handleResultClick(result.tool.id);
                            setMobileOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-muted transition-colors"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            {localize(result.tool.name, locale)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 px-4">
                <SheetClose asChild>
                  <button
                    onClick={() => {
                      navigateHome();
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {t('header.home')}
                  </button>
                </SheetClose>

                <SheetClose asChild>
                  <button
                    onClick={() => {
                      navigateToFavorites();
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Heart className="h-4 w-4 text-red-500" />
                    {t('common.favorites')}
                    {favorites.length > 0 && (
                      <span className="ms-auto text-xs font-bold text-red-500">{favorites.length}</span>
                    )}
                  </button>
                </SheetClose>

                <div className="my-2 border-t border-border" />

                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('header.categories')}
                </p>

                {categories.map((cat) => {
                  const CatIcon = getToolIcon(cat.icon);
                  return (
                    <SheetClose key={cat.slug} asChild>
                      <button
                        onClick={() => {
                          navigateToCategory(cat.slug);
                        }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <CatIcon className="h-4 w-4 text-muted-foreground" />
                        {localize(cat.name, locale)}
                        <span className="ms-auto text-xs text-muted-foreground">
                          {cat.toolCount}
                        </span>
                      </button>
                    </SheetClose>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Bar (visible on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
          <Input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="ps-9 pe-4 h-9 w-full glass-input bg-muted/50 border-border/50"
          />

          {/* Mobile Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 inset-x-0 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => {
                const Icon = getToolIcon(result.tool.icon);
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={result.tool.id}
                    onClick={() => handleResultClick(result.tool.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-start transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/10 text-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center h-7 w-7 rounded-md shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {localize(result.tool.name, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {getCategoryName(result.tool.category, locale)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {isSearchOpen && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute top-full mt-1 inset-x-0 bg-popover border border-border rounded-lg shadow-lg z-50 p-3 text-center text-sm text-muted-foreground">
              {t('search.noResults')}
            </div>
          )}
        </div>
      </div>

      {/* Animated gradient border at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
    </header>
  );
}
