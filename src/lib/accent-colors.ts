/**
 * Accent color definitions and utilities for the Theme Customizer.
 * Colors are applied via CSS custom properties on the :root element.
 */

export interface AccentColor {
  id: string;
  name: { en: string; ar: string };
  hex: string;
  oklch: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'emerald',
    name: { en: 'Emerald', ar: 'زمردي' },
    hex: '#10B981',
    oklch: 'oklch(0.65 0.18 163)',
  },
  {
    id: 'teal',
    name: { en: 'Teal', ar: 'تركوازي' },
    hex: '#14B8A6',
    oklch: 'oklch(0.65 0.15 175)',
  },
  {
    id: 'cyan',
    name: { en: 'Cyan', ar: 'سماوي' },
    hex: '#06B6D4',
    oklch: 'oklch(0.70 0.15 195)',
  },
  {
    id: 'sky',
    name: { en: 'Sky', ar: 'سماوي فاتح' },
    hex: '#0EA5E9',
    oklch: 'oklch(0.65 0.15 230)',
  },
  {
    id: 'violet',
    name: { en: 'Violet', ar: 'بنفسجي' },
    hex: '#8B5CF6',
    oklch: 'oklch(0.55 0.20 300)',
  },
  {
    id: 'rose',
    name: { en: 'Rose', ar: 'وردي' },
    hex: '#F43F5E',
    oklch: 'oklch(0.60 0.20 10)',
  },
  {
    id: 'amber',
    name: { en: 'Amber', ar: 'كهرماني' },
    hex: '#F59E0B',
    oklch: 'oklch(0.75 0.18 80)',
  },
  {
    id: 'orange',
    name: { en: 'Orange', ar: 'برتقالي' },
    hex: '#F97316',
    oklch: 'oklch(0.70 0.20 55)',
  },
];

const STORAGE_KEY = 'quickshed-accent-color';
const DEFAULT_COLOR_ID = 'emerald';

/**
 * Find an AccentColor by its id.
 */
export function getAccentColorById(id: string): AccentColor | undefined {
  return ACCENT_COLORS.find((c) => c.id === id);
}

/**
 * Apply an accent color by setting CSS custom properties on :root.
 * This modifies --ring, --chart-1, and adds a custom --accent-custom variable.
 */
export function applyAccentColor(colorId: string): void {
  const color = getAccentColorById(colorId);
  if (!color) return;

  const root = document.documentElement;
  root.style.setProperty('--ring', color.oklch);
  root.style.setProperty('--chart-1', color.oklch);
  root.style.setProperty('--accent-custom', color.oklch);

  // Persist selection
  try {
    localStorage.setItem(STORAGE_KEY, colorId);
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Reset the accent color to the default emerald.
 * Removes CSS custom property overrides so the original :root values take effect.
 */
export function resetAccentColor(): void {
  const root = document.documentElement;
  // Remove inline overrides so :root / .dark CSS values take over
  root.style.removeProperty('--ring');
  root.style.removeProperty('--chart-1');
  root.style.removeProperty('--accent-custom');

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * Read the saved accent color id from localStorage.
 * Returns null if nothing is saved.
 */
export function getSavedAccentColor(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
