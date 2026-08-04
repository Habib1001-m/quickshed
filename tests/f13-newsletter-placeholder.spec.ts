import { expect, test, type Page } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 1280, height: 900 },
];

const COPY = {
  en: {
    title: 'Newsletter — Coming Soon',
    description: 'A privacy-first update list is planned. There is no sign-up form yet.',
    status: '🚀 Coming Soon',
  },
  ar: {
    title: 'النشرة البريدية — قريباً',
    description: 'نخطط لقائمة تحديثات تحترم الخصوصية. لا يوجد نموذج اشتراك بعد.',
    status: '🚀 قريباً',
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

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} keeps the newsletter placeholder honest and non-interactive`, async ({ page }) => {
    for (const theme of ['light', 'dark'] as const) {
      for (const viewport of VIEWPORTS) {
        await page.setViewportSize(viewport);
        await visitHome(page, locale, theme);

        const copy = COPY[locale];
        const placeholder = page.getByTestId('newsletter-placeholder');

        await expect(placeholder).toBeVisible();
        await expect(placeholder).toHaveAttribute('aria-labelledby', 'newsletter-placeholder-title');
        await expect(placeholder).toHaveAttribute('aria-describedby', 'newsletter-placeholder-description');
        await expect(placeholder.getByRole('heading', { name: copy.title, exact: true })).toBeVisible();
        await expect(placeholder.getByText(copy.description, { exact: true })).toBeVisible();
        await expect(placeholder.getByText(copy.status, { exact: true })).toBeVisible();

        expect(await placeholder.locator('form, input, textarea, select, button, a').count()).toBe(0);
        expect(await placeholder.locator('.coming-soon-shimmer').count()).toBe(0);

        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        }));
        expect(layout.scrollWidth).toBe(layout.viewportWidth);
      }
    }
  });
}
