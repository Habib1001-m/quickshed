import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 1280, height: 900 },
];

const HOME_COPY = {
  en: {
    direction: 'ltr',
    categories: 'All Categories',
    why: 'Why QuickShed?',
    spotlight: 'Tool Spotlight',
    featured: 'Featured Tools',
    cta: 'Ready to get started?',
  },
  ar: {
    direction: 'rtl',
    categories: 'جميع التصنيفات',
    why: 'لماذا كويك شيد؟',
    spotlight: 'أداة مميزة',
    featured: 'الأدوات المميزة',
    cta: 'مستعد للبدء؟',
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

async function openHome(
  page: Page,
  locale: 'en' | 'ar',
  theme: 'light' | 'dark',
  viewport: (typeof VIEWPORTS)[number],
) {
  await page.setViewportSize(viewport);
  await page.goto(`/${locale}`);
  await page.evaluate((selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
  }, theme);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
  await expect(page.getByRole('main')).toBeVisible();
}

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} preserves HomeView composition across themes and viewports`, async ({ page }) => {
    for (const theme of ['light', 'dark'] as const) {
      for (const viewport of VIEWPORTS) {
        await openHome(page, locale, theme, viewport);

        await expect(page.locator('html')).toHaveAttribute('dir', HOME_COPY[locale].direction);
        await expect(page.locator('[data-onboarding="welcome"]')).toBeVisible();
        await expect(page.locator('[data-onboarding="search"]')).toBeVisible();
        await expect(page.locator('[data-onboarding="categories"]')).toBeVisible();
        await expect(
          page.getByRole('heading', { name: HOME_COPY[locale].categories, exact: true }),
        ).toBeVisible();

        const expectedHeadings = [
          HOME_COPY[locale].why,
          HOME_COPY[locale].categories,
          HOME_COPY[locale].spotlight,
          HOME_COPY[locale].featured,
          HOME_COPY[locale].cta,
        ];
        const headingOrder = await page.locator('main h1, main h2').allTextContents();
        const headingIndexes = expectedHeadings.map((heading) => headingOrder.indexOf(heading));
        expect(headingIndexes.every((index) => index >= 0)).toBe(true);
        expect(headingIndexes).toEqual([...headingIndexes].sort((a, b) => a - b));

        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        }));
        expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      }
    }
  });
}

test('HomeView keeps hero search and category navigation working', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/en');

  const searchRegion = page.locator('[data-onboarding="search"]');
  await searchRegion.locator('input').fill('json formatter');
  const searchResult = searchRegion.getByRole('button').filter({ hasText: 'JSON Formatter' }).first();
  await expect(searchResult).toBeVisible();
  await searchResult.click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/en/tools/json-formatter');

  await page.goto('/en');
  const viewAllTools = page
    .locator('[data-onboarding="categories"]')
    .getByRole('button', { name: 'View All Tools', exact: true });
  await viewAllTools.click();
  await expect.poll(() => new URL(page.url()).pathname).toBe('/en/all-tools');

  await page.goto('/ar');
  const firstCategory = page.locator('[data-onboarding="categories"] [role="button"]').first();
  await expect(firstCategory).toBeVisible();
  await firstCategory.click();
  await expect.poll(() => new URL(page.url()).pathname).toMatch(/^\/ar\/category\//);
});
