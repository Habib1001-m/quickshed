import { expect, test, type Page } from '@playwright/test';

type Locale = 'en' | 'ar';

const HEADER_COPY: Record<Locale, {
  direction: 'ltr' | 'rtl';
  menu: string;
  favorites: string;
  theme: string;
  language: string;
  customizer: string;
  settings: string;
}> = {
  en: {
    direction: 'ltr',
    menu: 'Menu',
    favorites: 'Favorites',
    theme: 'Toggle theme',
    language: 'العربية',
    customizer: 'Theme Customizer',
    settings: 'Settings',
  },
  ar: {
    direction: 'rtl',
    menu: 'القائمة',
    favorites: 'المفضلة',
    theme: 'تبديل السمة',
    language: 'English',
    customizer: 'تخصيص المظهر',
    settings: 'الإعدادات',
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

async function openHome(page: Page, locale: Locale, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`/${locale}`);
  await expect(page.locator('html')).toHaveAttribute('dir', HEADER_COPY[locale].direction);
  await expect(page.locator('header')).toBeVisible();
}

async function expectHeaderFits(page: Page, width: number) {
  const geometry = await page.locator('header').evaluate((header) => {
    const visibleControls = Array.from(header.querySelectorAll('button'))
      .filter((button) => {
        const style = window.getComputedStyle(button);
        const rect = button.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      })
      .map((button) => {
        const rect = button.getBoundingClientRect();
        return {
          label: button.getAttribute('aria-label'),
          left: rect.left,
          right: rect.right,
        };
      });

    return {
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      visibleControls,
    };
  });

  expect(geometry.viewport).toBe(width);
  expect(geometry.scrollWidth).toBe(width);
  for (const control of geometry.visibleControls) {
    expect(control.left, `${control.label ?? 'unnamed'} left edge`).toBeGreaterThanOrEqual(0);
    expect(control.right, `${control.label ?? 'unnamed'} right edge`).toBeLessThanOrEqual(width);
  }
}

async function expectMobileActionHidden(page: Page, label: string) {
  await expect(
    page.locator('header').getByRole('button', { name: label, exact: true }).first(),
  ).toBeHidden();
}

for (const locale of ['en', 'ar'] as const) {
  const copy = HEADER_COPY[locale];

  test.describe(`${locale} responsive Header`, () => {
    test('keeps the menu inside narrow viewports without horizontal overflow', async ({ page }) => {
      for (const width of [320, 360, 390, 414, 480]) {
        await openHome(page, locale, width);

        const header = page.locator('header');
        const menu = header.getByRole('button', { name: copy.menu, exact: true });
        await expect(menu).toBeVisible();
        const box = await menu.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);

        await expectMobileActionHidden(page, copy.favorites);
        await expectMobileActionHidden(page, copy.theme);
        await expectMobileActionHidden(page, copy.language);
        await expectMobileActionHidden(page, copy.customizer);
        await expect(
          header.getByRole('button', { name: copy.settings, exact: true }).first(),
        ).toBeVisible();
        await expectHeaderFits(page, width);
      }
    });

    test('keeps utility actions reachable from the mobile drawer', async ({ page }) => {
      await openHome(page, locale, 390);

      const header = page.locator('header');
      await header.getByRole('button', { name: copy.menu, exact: true }).click();

      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('button', { name: copy.favorites, exact: true })).toBeVisible();
      await expect(drawer.getByRole('button', { name: copy.theme, exact: true })).toBeVisible();
      await expect(drawer.getByRole('button', { name: copy.language, exact: true })).toBeVisible();
      await expect(drawer.getByRole('button', { name: copy.customizer, exact: true })).toBeVisible();
      await expect(drawer.getByRole('button', { name: copy.settings, exact: true })).toBeVisible();

      await drawer.getByRole('button', { name: copy.customizer, exact: true }).click();
      await expect(
        page.getByRole('dialog', { name: copy.customizer, exact: true }),
      ).toBeVisible();
    });

    test('opens Settings from the mobile drawer', async ({ page }) => {
      await openHome(page, locale, 390);

      const header = page.locator('header');
      await header.getByRole('button', { name: copy.menu, exact: true }).click();
      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();

      await drawer.getByRole('button', { name: copy.settings, exact: true }).click();
      await expect(page.getByRole('heading', { name: copy.settings, exact: true })).toBeVisible();
    });

    test('keeps the desktop utility row at the large breakpoint', async ({ page }) => {
      for (const width of [1024, 1280]) {
        await openHome(page, locale, width);

        const header = page.locator('header');
        await expect(header.getByRole('button', { name: copy.menu, exact: true })).toBeHidden();
        await expect(header.getByRole('button', { name: copy.favorites, exact: true })).toBeVisible();
        await expect(header.getByRole('button', { name: copy.theme, exact: true })).toBeVisible();
        await expect(header.getByRole('button', { name: copy.language, exact: true })).toBeVisible();
        await expect(header.getByRole('button', { name: copy.customizer, exact: true })).toBeVisible();
        await expect(header.getByRole('button', { name: copy.settings, exact: true })).toBeVisible();
        await expectHeaderFits(page, width);
      }
    });
  });
}
