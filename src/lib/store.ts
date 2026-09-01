import { create } from 'zustand';
import { addToolHistoryEntry } from '@/lib/tool-history';
import {
  safeJsonParse,
  normalizeStringArray,
  normalizeUsageRecord,
  normalizeCollections,
  MAX_RECENT_TOOLS,
  MAX_COMPARE_TOOLS,
  type ToolCollection,
} from '@/lib/storage-shapes';

export type View = 'home' | 'category' | 'categories' | 'tool' | 'all-tools' | 'favorites';

export type Locale = 'ar' | 'en';

// ToolCollection is owned by src/lib/storage-shapes (shared with the
// backup-import validator and the runtime normalizers) and re-exported here
// so existing `import { ToolCollection } from '@/lib/store'` sites work.
export type { ToolCollection };

interface AppState {
  // Navigation
  currentView: View;
  selectedCategory: string | null;
  selectedTool: string | null;

  // i18n
  locale: Locale;
  isHydrated: boolean;

  // Search
  searchQuery: string;
  isSearchOpen: boolean;

  // Favorites
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;

  // Recently Used
  recentTools: string[];
  addRecentTool: (toolId: string) => void;
  clearRecentTools: () => void;

  // Tool Usage Counter
  toolUsageCount: Record<string, number>;
  incrementToolUsage: (toolId: string) => void;

  // Collections
  collections: ToolCollection[];
  createCollection: (name: string) => string;
  deleteCollection: (collectionId: string) => void;
  renameCollection: (collectionId: string, newName: string) => void;
  addToolToCollection: (collectionId: string, toolId: string) => void;
  removeToolFromCollection: (collectionId: string, toolId: string) => void;
  isToolInCollection: (collectionId: string, toolId: string) => boolean;

  // Compare tools
  compareToolIds: string[];
  addToCompare: (toolId: string) => void;
  removeFromCompare: (toolId: string) => void;
  clearCompare: () => void;
  isInCompare: (toolId: string) => boolean;

  // Actions
  navigateHome: () => void;
  navigateToCategory: (categorySlug: string) => void;
  navigateToCategories: () => void;
  navigateToTool: (toolId: string) => void;
  navigateToAllTools: () => void;
  navigateToFavorites: () => void;
  setLocale: (locale: Locale) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  hydrateLocale: () => void;
  initFromURL: (pathname?: string) => void;
  initFromProps: (view: View, toolId?: string | null, categorySlug?: string | null) => void;
}

const LOCALE_STORAGE_KEY = 'quickshed-locale';
const FAVORITES_STORAGE_KEY = 'quickshed-favorites';
const RECENT_STORAGE_KEY = 'quickshed-recent';
const USAGE_COUNT_KEY = 'quickshed-usage';
const COLLECTIONS_KEY = 'quickshed-collections';
const COMPARE_KEY = 'quickshed-compare';
// MAX_RECENT_TOOLS and MAX_COMPARE_TOOLS are imported from storage-shapes so
// the readers and writers share one definition of each cap.

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {
    // localStorage not available
  }
  return 'en';
}

function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage not available
  }
}

function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeStringArray(safeJsonParse(localStorage.getItem(FAVORITES_STORAGE_KEY)));
  } catch {
    // localStorage not available
  }
  return [];
}

function persistFavorites(favorites: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // localStorage not available
  }
}

function getStoredRecentTools(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeStringArray(
      safeJsonParse(localStorage.getItem(RECENT_STORAGE_KEY)),
      MAX_RECENT_TOOLS,
    );
  } catch {
    // localStorage not available
  }
  return [];
}

function persistRecentTools(recentTools: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recentTools));
  } catch {
    // localStorage not available
  }
}

function getStoredUsageCount(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return normalizeUsageRecord(safeJsonParse(localStorage.getItem(USAGE_COUNT_KEY)));
  } catch {
    // localStorage not available
  }
  return {};
}

function persistUsageCount(counts: Record<string, number>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USAGE_COUNT_KEY, JSON.stringify(counts));
  } catch {
    // localStorage not available
  }
}

// F2: collections are normalized via the shared storage-shapes helper so a
// malformed/stale value (e.g. a collection missing `tools`, or a non-array
// root) can never crash a consumer that dereferences `collection.tools`.
// The import validator (src/lib/backup-import.ts) is the gate for the import
// path; this is defense-in-depth for any other source of stored data.
function getStoredCollections(): ToolCollection[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeCollections(safeJsonParse(localStorage.getItem(COLLECTIONS_KEY)));
  } catch {
    // localStorage not available
  }
  return [];
}

function persistCollections(collections: ToolCollection[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch {
    // localStorage not available
  }
}

function getStoredCompare(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeStringArray(
      safeJsonParse(localStorage.getItem(COMPARE_KEY)),
      MAX_COMPARE_TOOLS,
    );
  } catch {
    // localStorage not available
  }
  return [];
}

function persistCompare(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE_TOOLS)));
  } catch {
    // localStorage not available
  }
}

/** Helper to push browser history state without full navigation */
function pushURL(url: string) {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === url) return;
  window.history.pushState({}, '', url);
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentView: 'home',
  selectedCategory: null,
  selectedTool: null,

  // i18n — always start with 'en' to avoid hydration mismatch
  locale: 'en',
  isHydrated: false,

  // Search
  searchQuery: '',
  isSearchOpen: false,

  // Favorites — default empty, hydrated from localStorage
  favorites: [],
  toggleFavorite: (toolId: string) => {
    const current = get().favorites;
    const isFav = current.includes(toolId);
    const updated = isFav
      ? current.filter((id) => id !== toolId)
      : [...current, toolId];
    persistFavorites(updated);
    set({ favorites: updated });
  },
  isFavorite: (toolId: string) => {
    return get().favorites.includes(toolId);
  },

  // Recently Used — default empty, hydrated from localStorage
  recentTools: [],
  addRecentTool: (toolId: string) => {
    const current = get().recentTools;
    // Remove duplicate if exists, then add to front
    const filtered = current.filter((id) => id !== toolId);
    const updated = [toolId, ...filtered].slice(0, MAX_RECENT_TOOLS);
    persistRecentTools(updated);
    set({ recentTools: updated });
    // Track in tool history with timestamp
    addToolHistoryEntry(toolId);
  },
  clearRecentTools: () => {
    persistRecentTools([]);
    set({ recentTools: [] });
  },

  // Tool Usage Counter — default empty, hydrated from localStorage
  toolUsageCount: {},
  incrementToolUsage: (toolId: string) => {
    const current = get().toolUsageCount;
    const updated = { ...current, [toolId]: (current[toolId] || 0) + 1 };
    persistUsageCount(updated);
    set({ toolUsageCount: updated });
  },

  // Collections — default empty, hydrated from localStorage
  collections: [],
  createCollection: (name: string) => {
    const id = `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newCollection: ToolCollection = {
      id,
      name,
      tools: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...get().collections, newCollection];
    persistCollections(updated);
    set({ collections: updated });
    return id;
  },
  deleteCollection: (collectionId: string) => {
    const updated = get().collections.filter((c) => c.id !== collectionId);
    persistCollections(updated);
    set({ collections: updated });
  },
  renameCollection: (collectionId: string, newName: string) => {
    const updated = get().collections.map((c) =>
      c.id === collectionId ? { ...c, name: newName, updatedAt: Date.now() } : c
    );
    persistCollections(updated);
    set({ collections: updated });
  },
  addToolToCollection: (collectionId: string, toolId: string) => {
    const updated = get().collections.map((c) => {
      if (c.id === collectionId && !c.tools.includes(toolId)) {
        return { ...c, tools: [...c.tools, toolId], updatedAt: Date.now() };
      }
      return c;
    });
    persistCollections(updated);
    set({ collections: updated });
  },
  removeToolFromCollection: (collectionId: string, toolId: string) => {
    const updated = get().collections.map((c) => {
      if (c.id === collectionId) {
        return { ...c, tools: c.tools.filter((t) => t !== toolId), updatedAt: Date.now() };
      }
      return c;
    });
    persistCollections(updated);
    set({ collections: updated });
  },
  isToolInCollection: (collectionId: string, toolId: string) => {
    const collection = get().collections.find((c) => c.id === collectionId);
    return collection ? collection.tools.includes(toolId) : false;
  },

  // Compare tools — default empty, hydrated from localStorage
  compareToolIds: [],
  addToCompare: (toolId: string) => {
    const current = get().compareToolIds;
    if (current.includes(toolId) || current.length >= MAX_COMPARE_TOOLS) return;
    const updated = [...current, toolId];
    persistCompare(updated);
    set({ compareToolIds: updated });
  },
  removeFromCompare: (toolId: string) => {
    const updated = get().compareToolIds.filter((id) => id !== toolId);
    persistCompare(updated);
    set({ compareToolIds: updated });
  },
  clearCompare: () => {
    persistCompare([]);
    set({ compareToolIds: [] });
  },
  isInCompare: (toolId: string) => {
    return get().compareToolIds.includes(toolId);
  },

  // Actions — locale-aware navigation with URL updates
  navigateHome: () => {
    const locale = get().locale;
    pushURL(`/${locale}`);
    set({
      currentView: 'home',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  navigateToCategory: (categorySlug: string) => {
    const locale = get().locale;
    pushURL(`/${locale}/category/${categorySlug}`);
    set({
      currentView: 'category',
      selectedCategory: categorySlug,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  navigateToCategories: () => {
    const locale = get().locale;
    pushURL(`/${locale}/category`);
    set({
      currentView: 'categories',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  navigateToTool: (toolId: string) => {
    const locale = get().locale;
    pushURL(`/${locale}/tools/${toolId}`);
    set({
      currentView: 'tool',
      selectedTool: toolId,
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  navigateToAllTools: () => {
    const locale = get().locale;
    pushURL(`/${locale}/all-tools`);
    set({
      currentView: 'all-tools',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  navigateToFavorites: () => {
    const locale = get().locale;
    pushURL(`/${locale}/favorites`);
    set({
      currentView: 'favorites',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    });
  },

  setLocale: (locale: Locale) => {
    persistLocale(locale);
    // Navigate to the new locale URL so server components re-render
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const pathWithoutLocale = currentPath.replace(/^\/(en|ar)/, '') || '/';
      const newPath = `/${locale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
      if (currentPath !== newPath) {
        window.location.href = newPath;
        return; // Navigation will re-mount the app
      }
    }
    set({ locale });
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  setSearchOpen: (open: boolean) => set({ isSearchOpen: open }),

  // Call this in a useEffect to hydrate locale from localStorage after mount
  hydrateLocale: () => {
    const storedLocale = getStoredLocale();
    const storedFavorites = getStoredFavorites();
    const storedRecentTools = getStoredRecentTools();
    const storedUsageCount = getStoredUsageCount();
    const storedCollections = getStoredCollections();
    const storedCompare = getStoredCompare();
    set({
      locale: storedLocale,
      favorites: storedFavorites,
      recentTools: storedRecentTools,
      toolUsageCount: storedUsageCount,
      collections: storedCollections,
      compareToolIds: storedCompare,
      isHydrated: true,
    });
  },

  // Initialize navigation state from the current browser URL
  initFromURL: (pathname?: string) => {
    if (typeof window === 'undefined') return;
    const path = pathname || window.location.pathname;

    // Extract locale from URL
    const localeMatch = path.match(/^\/(en|ar)(?:\/|$)/);
    if (localeMatch) {
      const urlLocale = localeMatch[1];
      if (urlLocale !== get().locale) {
        persistLocale(urlLocale as Locale);
        set({ locale: urlLocale as Locale });
      }
    }

    const pathWithoutLocale = path.replace(/^\/(en|ar)/, '') || '/';

    const toolMatch = pathWithoutLocale.match(/^\/tools\/([^/]+)$/);
    if (toolMatch) {
      set({ currentView: 'tool', selectedTool: toolMatch[1], selectedCategory: null, searchQuery: '', isSearchOpen: false });
      return;
    }

    if (pathWithoutLocale === '/category') {
      set({ currentView: 'categories', selectedCategory: null, selectedTool: null, searchQuery: '', isSearchOpen: false });
      return;
    }

    const categoryMatch = pathWithoutLocale.match(/^\/category\/([^/]+)$/);
    if (categoryMatch) {
      set({ currentView: 'category', selectedCategory: categoryMatch[1], selectedTool: null, searchQuery: '', isSearchOpen: false });
      return;
    }

    if (pathWithoutLocale === '/all-tools') {
      set({ currentView: 'all-tools', selectedCategory: null, selectedTool: null, searchQuery: '', isSearchOpen: false });
      return;
    }

    if (pathWithoutLocale === '/favorites') {
      set({ currentView: 'favorites', selectedCategory: null, selectedTool: null, searchQuery: '', isSearchOpen: false });
      return;
    }

    // Default: home
    set({ currentView: 'home', selectedCategory: null, selectedTool: null, searchQuery: '', isSearchOpen: false });
  },

  // Initialize navigation state from server component props
  initFromProps: (view: View, toolId?: string | null, categorySlug?: string | null) => {
    set({
      currentView: view,
      selectedTool: toolId ?? null,
      selectedCategory: categorySlug ?? null,
      searchQuery: '',
      isSearchOpen: false,
    });
  },
}));
