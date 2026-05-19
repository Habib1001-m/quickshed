import { create } from 'zustand';
import { addToolHistoryEntry } from '@/lib/tool-history';

export type View = 'home' | 'category' | 'tool' | 'all-tools' | 'favorites';

export type Locale = 'ar' | 'en';

export interface ToolCollection {
  id: string;
  name: string;
  tools: string[];
  createdAt: number;
  updatedAt: number;
}

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
  navigateToTool: (toolId: string) => void;
  navigateToAllTools: () => void;
  navigateToFavorites: () => void;
  setLocale: (locale: Locale) => void;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  hydrateLocale: () => void;
}

const LOCALE_STORAGE_KEY = 'quickshed-locale';
const FAVORITES_STORAGE_KEY = 'quickshed-favorites';
const RECENT_STORAGE_KEY = 'quickshed-recent';
const USAGE_COUNT_KEY = 'quickshed-usage';
const COLLECTIONS_KEY = 'quickshed-collections';
const COMPARE_KEY = 'quickshed-compare';
const MAX_RECENT_TOOLS = 10;
const MAX_COMPARE_TOOLS = 3;

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
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // localStorage not available or invalid JSON
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
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // localStorage not available or invalid JSON
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
    const stored = localStorage.getItem(USAGE_COUNT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {
    // localStorage not available or invalid JSON
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

function getStoredCollections(): ToolCollection[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // localStorage not available or invalid JSON
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
    const stored = localStorage.getItem(COMPARE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_COMPARE_TOOLS);
    }
  } catch {
    // localStorage not available or invalid JSON
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

  // Actions
  navigateHome: () =>
    set({
      currentView: 'home',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    }),

  navigateToCategory: (categorySlug: string) =>
    set({
      currentView: 'category',
      selectedCategory: categorySlug,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    }),

  navigateToTool: (toolId: string) =>
    set({
      currentView: 'tool',
      selectedTool: toolId,
      searchQuery: '',
      isSearchOpen: false,
    }),

  navigateToAllTools: () =>
    set({
      currentView: 'all-tools',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    }),

  navigateToFavorites: () =>
    set({
      currentView: 'favorites',
      selectedCategory: null,
      selectedTool: null,
      searchQuery: '',
      isSearchOpen: false,
    }),

  setLocale: (locale: Locale) => {
    persistLocale(locale);
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
}));
