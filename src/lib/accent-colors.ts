/**
 * Accent color definitions and utilities for the Theme Customizer.
 * Colors are applied via CSS custom properties on the :root element.
 */

export interface AccentColor {
  id: string;
  name: { en: string; ar: string };
  hex: string;
  oklch: string;
  shades: AccentPalette;
}

type AccentShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';
type AccentPalette = Record<AccentShade, string>;

const ACCENT_SHADES: readonly AccentShade[] = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
];

// The app's existing UI uses emerald-* utility classes for accent surfaces,
// borders, text, and shadows. Each option supplies a complete replacement
// palette so the customizer affects those existing utilities consistently.
const ACCENT_PALETTES: Record<string, AccentPalette> = {
  emerald: {
    '50': '#ECFDF5',
    '100': '#D1FAE5',
    '200': '#A7F3D0',
    '300': '#6EE7B7',
    '400': '#34D399',
    '500': '#10B981',
    '600': '#059669',
    '700': '#047857',
    '800': '#065F46',
    '900': '#064E3B',
    '950': '#022C22',
  },
  teal: {
    '50': '#F0FDFA',
    '100': '#CCFBF1',
    '200': '#99F6E4',
    '300': '#5EEAD4',
    '400': '#2DD4BF',
    '500': '#14B8A6',
    '600': '#0D9488',
    '700': '#0F766E',
    '800': '#115E59',
    '900': '#134E4A',
    '950': '#042F2E',
  },
  cyan: {
    '50': '#ECFEFF',
    '100': '#CFFAFE',
    '200': '#A5F3FC',
    '300': '#67E8F9',
    '400': '#22D3EE',
    '500': '#06B6D4',
    '600': '#0891B2',
    '700': '#0E7490',
    '800': '#155E75',
    '900': '#164E63',
    '950': '#083344',
  },
  sky: {
    '50': '#F0F9FF',
    '100': '#E0F2FE',
    '200': '#BAE6FD',
    '300': '#7DD3FC',
    '400': '#38BDF8',
    '500': '#0EA5E9',
    '600': '#0284C7',
    '700': '#0369A1',
    '800': '#075985',
    '900': '#0C4A6E',
    '950': '#082F49',
  },
  violet: {
    '50': '#F5F3FF',
    '100': '#EDE9FE',
    '200': '#DDD6FE',
    '300': '#C4B5FD',
    '400': '#A78BFA',
    '500': '#8B5CF6',
    '600': '#7C3AED',
    '700': '#6D28D9',
    '800': '#5B21B6',
    '900': '#4C1D95',
    '950': '#2E1065',
  },
  rose: {
    '50': '#FFF1F2',
    '100': '#FFE4E6',
    '200': '#FECDD3',
    '300': '#FDA4AF',
    '400': '#FB7185',
    '500': '#F43F5E',
    '600': '#E11D48',
    '700': '#BE123C',
    '800': '#9F1239',
    '900': '#881337',
    '950': '#4C0519',
  },
  amber: {
    '50': '#FFFBEB',
    '100': '#FEF3C7',
    '200': '#FDE68A',
    '300': '#FCD34D',
    '400': '#FBBF24',
    '500': '#F59E0B',
    '600': '#D97706',
    '700': '#B45309',
    '800': '#92400E',
    '900': '#78350F',
    '950': '#451A03',
  },
  orange: {
    '50': '#FFF7ED',
    '100': '#FFEDD5',
    '200': '#FED7AA',
    '300': '#FDBA74',
    '400': '#FB923C',
    '500': '#F97316',
    '600': '#EA580C',
    '700': '#C2410C',
    '800': '#9A3412',
    '900': '#7C2D12',
    '950': '#431407',
  },
};

export const ACCENT_COLORS: AccentColor[] = [
  {
    id: 'emerald',
    name: { en: 'Emerald', ar: 'زمردي' },
    hex: '#10B981',
    oklch: 'oklch(0.65 0.18 163)',
    shades: ACCENT_PALETTES.emerald,
  },
  {
    id: 'teal',
    name: { en: 'Teal', ar: 'تركوازي' },
    hex: '#14B8A6',
    oklch: 'oklch(0.65 0.15 175)',
    shades: ACCENT_PALETTES.teal,
  },
  {
    id: 'cyan',
    name: { en: 'Cyan', ar: 'سماوي' },
    hex: '#06B6D4',
    oklch: 'oklch(0.70 0.15 195)',
    shades: ACCENT_PALETTES.cyan,
  },
  {
    id: 'sky',
    name: { en: 'Sky', ar: 'سماوي فاتح' },
    hex: '#0EA5E9',
    oklch: 'oklch(0.65 0.15 230)',
    shades: ACCENT_PALETTES.sky,
  },
  {
    id: 'violet',
    name: { en: 'Violet', ar: 'بنفسجي' },
    hex: '#8B5CF6',
    oklch: 'oklch(0.55 0.20 300)',
    shades: ACCENT_PALETTES.violet,
  },
  {
    id: 'rose',
    name: { en: 'Rose', ar: 'وردي' },
    hex: '#F43F5E',
    oklch: 'oklch(0.60 0.20 10)',
    shades: ACCENT_PALETTES.rose,
  },
  {
    id: 'amber',
    name: { en: 'Amber', ar: 'كهرماني' },
    hex: '#F59E0B',
    oklch: 'oklch(0.75 0.18 80)',
    shades: ACCENT_PALETTES.amber,
  },
  {
    id: 'orange',
    name: { en: 'Orange', ar: 'برتقالي' },
    hex: '#F97316',
    oklch: 'oklch(0.70 0.20 55)',
    shades: ACCENT_PALETTES.orange,
  },
];

const STORAGE_KEY = 'quickshed-accent-color';

/**
 * Find an AccentColor by its id.
 */
export function getAccentColorById(id: string): AccentColor | undefined {
  return ACCENT_COLORS.find((c) => c.id === id);
}

/**
 * Apply an accent color by setting CSS custom properties on :root.
 * The selected palette is also mapped to the existing emerald-* utility
 * variables used throughout the app, so the visible UI changes immediately.
 */
export function applyAccentColor(colorId: string): void {
  const color = getAccentColorById(colorId);
  if (!color) return;

  const root = document.documentElement;
  root.style.setProperty('--color-emerald', color.hex);
  for (const shade of ACCENT_SHADES) {
    root.style.setProperty(`--color-emerald-${shade}`, color.shades[shade]);
  }
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
  root.style.removeProperty('--color-emerald');
  for (const shade of ACCENT_SHADES) {
    root.style.removeProperty(`--color-emerald-${shade}`);
  }
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
 * Returns null if nothing is saved, or if the saved value is not a supported
 * accent id (stale/manually-edited). Returning null here lets both callers
 * fall back predictably: RoutePageShell skips applyAccentColor (so the
 * default emerald from :root applies) and ThemeCustomizer defaults to
 * 'emerald'. applyAccentColor also validates, but checking here keeps the
 * persisted selection and the highlighted swatch consistent.
 */
export function getSavedAccentColor(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    if (id && getAccentColorById(id)) return id;
    return null;
  } catch {
    return null;
  }
}
