import { expect, test, type Locator, type Page } from '@playwright/test';

type Locale = 'en' | 'ar';

const SEARCH_COPY: Record<Locale, {
  direction: 'ltr' | 'rtl';
  header: string;
  menu: string;
  palette: string;
}> = {
  en: {
    direction: 'ltr',
    header: 'Search tools...',
    menu: 'Menu',
    palette: 'Search for a tool...',
  },
  ar: {
    direction: 'rtl',
    header: 'ابحث عن أداة...',
    menu: 'القائمة',
    palette: 'ابحث عن أداة...',
  },
};

// Reuse the onboarding suppression used by the existing focused suites so
// overlays never intercept the search controls or keyboard shortcut.
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
  await expect(page.locator('html')).toHaveAttribute('dir', SEARCH_COPY[locale].direction);
  await expect(page.locator('header')).toBeVisible();
}

async function expectNamedSearch(search: Locator, name: string) {
  await expect.poll(() => search.count()).toBe(1);
  await expect(search).toBeVisible();
  await expect(search).toHaveAttribute('aria-label', name);
  await expect(search).toHaveAttribute('placeholder', name);
}

for (const locale of ['en', 'ar'] as const) {
  const copy = SEARCH_COPY[locale];

  test.describe(`${locale} accessible search names`, () => {
    test('desktop Header search has the localized accessible name', async ({ page }) => {
      await openHome(page, locale, 1280);

      const search = page.locator('header').getByRole('textbox', {
        name: copy.header,
        exact: true,
      });
      await expectNamedSearch(search, copy.header);
    });

    test('small-screen Header search has the localized accessible name', async ({ page }) => {
      await openHome(page, locale, 390);

      const search = page.locator('header').getByRole('textbox', {
        name: copy.header,
        exact: true,
      });
      await expectNamedSearch(search, copy.header);
    });

    test('mobile drawer search has the localized accessible name after opening the menu', async ({ page }) => {
      // Keep the drawer breakpoint while leaving enough room for the existing
      // Header action cluster; the 390px small-screen search is covered above.
      await openHome(page, locale, 600);

      const header = page.locator('header');
      const menu = header.getByRole('button', { name: copy.menu, exact: true });
      await expect(menu).toBeVisible();
      await menu.click();

      const drawer = page.getByRole('dialog');
      await expect(drawer).toBeVisible();
      await expectNamedSearch(
        drawer.getByRole('textbox', { name: copy.header, exact: true }),
        copy.header,
      );
    });

    test('Command Palette search has the localized accessible name after Ctrl+K', async ({ page }) => {
      await openHome(page, locale, 1280);
      // CommandPalette is a client-only dynamic component; wait for its
      // chunk to settle before sending the existing global shortcut.
      await page.waitForLoadState('networkidle');

      await page.keyboard.press('Control+K');

      const palette = page.getByRole('dialog', {
        name: locale === 'ar' ? 'لوحة الأوامر' : 'Command palette',
        exact: true,
      });
      try {
        await expect(palette).toBeVisible({ timeout: 1_000 });
      } catch {
        // Under a fully parallel run the dynamic component can finish mounting
        // just after network idle. Retry the user shortcut once after the
        // assertion window instead of relying on a fixed sleep.
        await page.keyboard.press('Control+K');
        await expect(palette).toBeVisible();
      }
      const search = palette.getByRole('textbox', {
        name: copy.palette,
        exact: true,
      });
      await expectNamedSearch(search, copy.palette);
      await expect(search).toBeFocused();
    });
  });
}
