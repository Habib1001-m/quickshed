import { expect, test } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

const COPY = {
  en: {
    direction: 'ltr',
    title: 'Before you use this tool',
    privacy: 'Privacy',
    offline: 'Offline availability',
    continue: 'Continue to tool',
  },
  ar: {
    direction: 'rtl',
    title: 'قبل استخدام هذه الأداة',
    privacy: 'الخصوصية',
    offline: 'العمل دون اتصال',
    continue: 'متابعة إلى الأداة',
  },
} as const;

for (const locale of ['en', 'ar'] as const) {
  test(`T012 ${locale} gates tool use behind an accessible disclosure`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
      localStorage.setItem('theme', 'dark');
    });

    await page.goto(`/${locale}/tools/json-formatter`);

    const copy = COPY[locale];
    const disclosure = page.getByTestId('tool-use-disclosure');
    await expect(disclosure).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
    await expect(disclosure).toHaveAttribute('dir', copy.direction);
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(disclosure.getByRole('heading', { name: copy.title, exact: true })).toBeVisible();
    await expect(disclosure.getByText(copy.privacy, { exact: true })).toBeVisible();
    await expect(disclosure.getByText(copy.offline, { exact: true })).toBeVisible();
    await expect(page.getByTestId('tool-use-content')).toHaveCount(0);
    await expect(disclosure).toHaveAttribute('aria-live', 'polite');
    await expect(disclosure).toHaveAttribute('aria-labelledby', /.+/);
    await expect(disclosure).toHaveAttribute('aria-describedby', /.+/);
    await expect.poll(() => page.evaluate(() => document.activeElement?.textContent?.trim())).toContain(copy.title);

    const dimensions = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);

    await expect(page.getByRole('button', { name: copy.continue, exact: true })).toBeEnabled();
    await continuePastToolDisclosure(page);
    await expect(page.getByTestId('tool-use-content')).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();
  });
}
