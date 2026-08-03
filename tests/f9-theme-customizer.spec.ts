import { expect, test, type Page } from '@playwright/test';

type Locale = 'en' | 'ar';

const COPY: Record<Locale, {
  direction: 'ltr' | 'rtl';
  home: string;
  customizer: string;
  violet: string;
  reset: string;
}> = {
  en: {
    direction: 'ltr',
    home: 'Home',
    customizer: 'Theme Customizer',
    violet: 'Violet',
    reset: 'Reset to Default',
  },
  ar: {
    direction: 'rtl',
    home: 'الرئيسية',
    customizer: 'تخصيص المظهر',
    violet: 'بنفسجي',
    reset: 'إعادة للون الافتراضي',
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

async function readVisibleAccent(page: Page, locale: Locale) {
  const homeIcon = page
    .locator(`header button[aria-label="${COPY[locale].home}"] > div`)
    .first();

  return homeIcon.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    palette50: getComputedStyle(document.documentElement).getPropertyValue('--color-emerald-50').trim(),
    palette500: getComputedStyle(document.documentElement).getPropertyValue('--color-emerald-500').trim(),
    palette950: getComputedStyle(document.documentElement).getPropertyValue('--color-emerald-950').trim(),
    inlinePalette500: document.documentElement.style.getPropertyValue('--color-emerald-500').trim(),
    stored: localStorage.getItem('quickshed-accent-color'),
  }));
}

for (const locale of ['en', 'ar'] as const) {
  const copy = COPY[locale];

  test(`${locale} applies the selected accent across the app and persists it`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/${locale}`);
    await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
    await expect(page.locator('header')).toBeVisible();

    const before = await readVisibleAccent(page, locale);
    await page.locator('header').getByRole('button', { name: copy.customizer, exact: true }).click();

    const dialog = page.getByRole('dialog', { name: copy.customizer, exact: true });
    await expect(dialog).toBeVisible();
    const violet = dialog.getByRole('button', { name: copy.violet, exact: true });
    await expect(violet).toHaveAttribute('aria-pressed', 'false');

    await violet.click();
    await expect(violet).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => readVisibleAccent(page, locale)).toMatchObject({
      background: 'rgb(139, 92, 246)',
      palette50: '#F5F3FF',
      palette500: '#8B5CF6',
      palette950: '#2E1065',
      inlinePalette500: '#8B5CF6',
      stored: 'violet',
    });

    const after = await readVisibleAccent(page, locale);
    expect(after.background).not.toBe(before.background);

    await page.reload();
    await expect(page.locator('header')).toBeVisible();
    await expect.poll(() => readVisibleAccent(page, locale)).toMatchObject({
      background: 'rgb(139, 92, 246)',
      palette500: '#8B5CF6',
      stored: 'violet',
    });

    await page.locator('header').getByRole('button', { name: copy.customizer, exact: true }).click();
    const reloadedDialog = page.getByRole('dialog', { name: copy.customizer, exact: true });
    await expect(reloadedDialog.getByRole('button', { name: copy.violet, exact: true })).toHaveAttribute('aria-pressed', 'true');

    await reloadedDialog.getByRole('button', { name: copy.reset, exact: true }).click();
    await expect.poll(() => readVisibleAccent(page, locale)).toMatchObject({
      inlinePalette500: '',
      stored: null,
    });
  });
}
