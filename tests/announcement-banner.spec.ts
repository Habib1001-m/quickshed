import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 1280, height: 900 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('quickshed-banner-dismissed');
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
  });
});

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} keeps the announcement above the Header and content`, async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}`);

      const banner = page.getByTestId('announcement-banner');
      await expect(banner).toBeVisible();
      await expect(page.locator('header')).toBeVisible();

      await expect.poll(async () => page.evaluate(() => {
        const banner = document.querySelector('[data-testid="announcement-banner"]');
        const header = document.querySelector('header');
        const content = document.querySelector('main > :first-child');
        if (!banner || !header || !content) return false;

        const bannerRect = banner.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        const contentRect = content.getBoundingClientRect();
        return bannerRect.bottom <= headerRect.top + 1 && headerRect.bottom <= contentRect.top + 1;
      })).toBe(true);

      const geometry = await page.evaluate(() => {
        const getRect = (selector: string) => {
          const element = document.querySelector(selector);
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, height: rect.height };
        };

        return {
          banner: getRect('[data-testid="announcement-banner"]'),
          header: getRect('header'),
          main: getRect('main'),
          content: getRect('main > :first-child'),
          viewportWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.banner).not.toBeNull();
      expect(geometry.header).not.toBeNull();
      expect(geometry.main).not.toBeNull();
      expect(geometry.content).not.toBeNull();
      expect(geometry.banner!.bottom).toBeLessThanOrEqual(geometry.header!.top + 1);
      expect(geometry.header!.bottom).toBeLessThanOrEqual(geometry.content!.top + 1);
      expect(geometry.scrollWidth).toBe(geometry.viewportWidth);
    }
  });

  test(`${locale} auto-dismisses the announcement on first site interaction`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(`/${locale}`);

    await expect(page.getByTestId('announcement-banner')).toBeVisible();
    await page.getByRole('button', { name: locale === 'ar' ? 'القائمة' : 'Menu', exact: true }).click();

    await expect(page.getByTestId('announcement-banner')).toBeHidden();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect.poll(() => page.evaluate(() => localStorage.getItem('quickshed-banner-dismissed'))).toBe('true');
  });
}
