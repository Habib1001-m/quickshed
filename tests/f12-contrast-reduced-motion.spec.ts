import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 1280, height: 900 },
];

const COPY = {
  en: {
    tryNow: 'Try Now',
    searchCta: 'Search for a tool',
    footerPrivacy: 'Tool inputs and files stay in your browser. The application does not transmit them off-device.',
    backToTop: 'Back to top',
  },
  ar: {
    tryNow: 'جرب الآن',
    searchCta: 'ابحث عن أداة',
    footerPrivacy: 'تبقى مدخلات الأدوات وملفاتك في متصفحك ولا ينقلها التطبيق خارج جهازك.',
    backToTop: 'العودة للأعلى',
  },
} as const;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.removeItem('quickshed-accent-color');
  });
});

async function visitHome(
  page: Page,
  locale: 'en' | 'ar',
  theme: 'light' | 'dark',
) {
  await page.goto(`/${locale}`);
  await page.evaluate((selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
  }, theme);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('main')).toBeVisible();
}

async function expectTheme(page: Page, theme: 'light' | 'dark') {
  await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
}

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} keeps primary surfaces readable across themes and viewports`, async ({ page }) => {
    for (const theme of ['light', 'dark'] as const) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await visitHome(page, locale, theme);
        await expectTheme(page, theme);

        const labels = COPY[locale];
        await expect(page.getByRole('button', { name: labels.tryNow, exact: true })).toHaveClass(/bg-emerald-700/);
        await expect(page.getByRole('button', { name: labels.searchCta, exact: true })).toHaveClass(/bg-emerald-700/);
        await expect(page.getByText(labels.footerPrivacy, { exact: true })).toHaveClass(/text-emerald-800/);

        const contrast = await page.getByRole('button', { name: labels.tryNow, exact: true }).evaluate((button) => {
          const parseRgb = (value: string) => {
            const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];
            if (channels.length < 3) throw new Error(`Unable to parse CSS color: ${value}`);
            return channels.slice(0, 3);
          };
          const toLinear = (channel: number) => {
            const normalized = channel / 255;
            return normalized <= 0.03928
              ? normalized / 12.92
              : ((normalized + 0.055) / 1.055) ** 2.4;
          };
          const luminance = (color: string) => {
            const [red, green, blue] = parseRgb(color).map(toLinear);
            return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
          };
          const styles = getComputedStyle(button);
          const foreground = luminance(styles.color);
          const background = luminance(styles.backgroundColor);
          const lighter = Math.max(foreground, background);
          const darker = Math.min(foreground, background);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            ratio: (lighter + 0.05) / (darker + 0.05),
          };
        });
        expect(contrast.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);

        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        }));
        expect(layout.scrollWidth).toBe(layout.viewportWidth);

        const textBearingEmerald500 = await page.locator('button:visible').evaluateAll((buttons) =>
          buttons
            .filter((button) => {
              const classes = button.className.toString().split(/\s+/);
              return classes.includes('bg-emerald-500') && classes.includes('text-white') && Boolean(button.textContent?.trim());
            })
            .map((button) => button.textContent?.trim()),
        );
        expect(textBearingEmerald500).toEqual([]);
      }
    }
  });

  test(`${locale} honors reduced motion for CSS and programmatic scrolling`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await visitHome(page, locale, 'light');
    const labels = COPY[locale];

    await page.evaluate(() => {
      const typedWindow = window as typeof window & {
        __f12ScrollCalls?: ScrollToOptions[];
        __f12OriginalScrollTo?: typeof window.scrollTo;
      };
      typedWindow.__f12ScrollCalls = [];
      typedWindow.__f12OriginalScrollTo = window.scrollTo;
      window.scrollTo = ((...args: Parameters<typeof window.scrollTo>) => {
        const firstArgument = args[0];
        if (typeof firstArgument === 'object' && firstArgument !== null) {
          typedWindow.__f12ScrollCalls?.push(firstArgument as ScrollToOptions);
        }
      }) as typeof window.scrollTo;
    });

    await page.getByRole('button', { name: labels.backToTop, exact: true }).click();

    const motionState = await page.evaluate(() => {
      const toMilliseconds = (value: string) => value.split(',').reduce((maximum, item) => {
        const trimmed = item.trim();
        const number = Number.parseFloat(trimmed);
        if (!Number.isFinite(number)) return maximum;
        return Math.max(maximum, trimmed.endsWith('ms') ? number : number * 1000);
      }, 0);

      const interactive = [...document.querySelectorAll('a,button,input,textarea,select,[role="button"]')]
        .filter((element) => {
          const styles = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && styles.visibility !== 'hidden' && styles.display !== 'none';
        });

      const offenders = interactive
        .map((element) => {
          const styles = getComputedStyle(element);
          return {
            text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60),
            transition: toMilliseconds(styles.transitionDuration),
            animation: toMilliseconds(styles.animationDuration),
          };
        })
        .filter((element) => element.transition > 0.1 || element.animation > 0.1);

      const typedWindow = window as typeof window & {
        __f12ScrollCalls?: ScrollToOptions[];
        __f12OriginalScrollTo?: typeof window.scrollTo;
      };
      const calls = typedWindow.__f12ScrollCalls ?? [];
      if (typedWindow.__f12OriginalScrollTo) {
        window.scrollTo = typedWindow.__f12OriginalScrollTo;
      }

      return {
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        offenders,
        explicitScrollBehavior: calls[0]?.behavior,
      };
    });

    expect(motionState.prefersReducedMotion).toBe(true);
    expect(motionState.scrollBehavior).toBe('auto');
    expect(motionState.offenders).toEqual([]);
    expect(motionState.explicitScrollBehavior).toBe('auto');
  });
}
