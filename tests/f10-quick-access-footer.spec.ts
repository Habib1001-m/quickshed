import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.setItem(
      'quickshed-tool-history',
      JSON.stringify([
        { id: 'f10-json-formatter', toolId: 'json-formatter', timestamp: 1_725_000_000_000 },
      ]),
    );
  });
});

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} keeps the footer clear of the expanded Quick Access bar`, async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto(`/${locale}/tools/json-formatter`);
      const quickAccess = page.getByTestId('quick-access-bar');
      await expect(quickAccess).toBeVisible();
      await expect(page.getByTestId('quick-access-layout-reserve')).toBeVisible();

      await expect.poll(async () => page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
        const footer = document.querySelector('footer');
        const bar = document.querySelector('[data-testid="quick-access-bar"]');
        if (!footer || !bar) return false;

        const footerRect = footer.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        return footerRect.bottom <= barRect.top + 1;
      })).toBe(true);

      const geometry = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        const bar = document.querySelector('[data-testid="quick-access-bar"]');
        if (!footer || !bar) return null;

        const footerRect = footer.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        return {
          footerBottom: footerRect.bottom,
          barTop: barRect.top,
          barBottom: barRect.bottom,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      });

      expect(geometry).not.toBeNull();
      expect(geometry!.footerBottom).toBeLessThanOrEqual(geometry!.barTop + 1);
      expect(geometry!.barBottom).toBeLessThanOrEqual(geometry!.viewportHeight + 1);
      expect(geometry!.scrollWidth).toBeLessThanOrEqual(geometry!.viewportWidth);
    }
  });
}
