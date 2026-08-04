import { expect, test, type Page } from '@playwright/test';

type Locale = 'en' | 'ar';

const COPY: Record<Locale, {
  direction: 'ltr' | 'rtl';
  skip: string;
  backToTop: string;
  quickAccess: string;
  heroSearch: string;
  allToolsSearch: string;
  favoritesSearch: string;
  clearFavoritesSearch: string;
  viewGrid: string;
  viewList: string;
  removeFavorite: string;
}> = {
  en: {
    direction: 'ltr',
    skip: 'Skip to main content',
    backToTop: 'Back to top',
    quickAccess: 'Quick Access',
    heroSearch: 'Search for a tool...',
    allToolsSearch: 'Search across all tools...',
    favoritesSearch: 'Search favorites...',
    clearFavoritesSearch: 'Clear favorites search',
    viewGrid: 'Grid view',
    viewList: 'List view',
    removeFavorite: 'Remove from favorites',
  },
  ar: {
    direction: 'rtl',
    skip: 'تخطّي إلى المحتوى الرئيسي',
    backToTop: 'العودة للأعلى',
    quickAccess: 'وصول سريع',
    heroSearch: 'ابحث عن أداة...',
    allToolsSearch: 'ابحث في جميع الأدوات...',
    favoritesSearch: 'ابحث في المفضلة...',
    clearFavoritesSearch: 'مسح بحث المفضلة',
    viewGrid: 'عرض شبكي',
    viewList: 'عرض قائمة',
    removeFavorite: 'إزالة من المفضلة',
  },
};

const VIEWPORTS = [
  { width: 320, height: 800 },
  { width: 1280, height: 900 },
];

async function assertShellContract(page: Page, locale: Locale) {
  const copy = COPY[locale];
  const main = page.locator('main#main-content');

  await expect(page.locator('html')).toHaveAttribute('lang', locale);
  await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
  await expect(page.locator('header.fixed')).toHaveCount(1);
  await expect(main).toHaveCount(1);
  await expect(main).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('h1:visible')).toHaveCount(1);

  const layout = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const clientWidth = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>('*')]
      .map((element) => ({
        tagName: element.tagName.toLowerCase(),
        className: element.className.toString().slice(0, 120),
        text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80),
        right: Math.round(element.getBoundingClientRect().right),
      }))
      .filter((element) => element.right > viewportWidth + 1)
      .slice(0, 12);
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth,
      viewportWidth,
      offenders,
    };
  });
  expect(layout.scrollWidth, JSON.stringify(layout.offenders)).toBe(layout.clientWidth);
  expect(layout.clientWidth).toBeLessThanOrEqual(layout.viewportWidth);

  const unnamedControls = await page.locator(
    'a:visible, button:visible, input:visible, select:visible, textarea:visible, [role="button"]:visible',
  ).evaluateAll((elements) => elements.flatMap((element) => {
    const htmlElement = element as HTMLElement;
    const tagName = htmlElement.tagName.toLowerCase();
    const input = htmlElement as HTMLInputElement;
    const labelledBy = htmlElement.getAttribute('aria-labelledby');
    const labelledText = labelledBy
      ? labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? '').join(' ')
      : '';
    const visibleText = htmlElement.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const name = [
      htmlElement.getAttribute('aria-label'),
      labelledText,
      visibleText,
      input.getAttribute('placeholder'),
      input.getAttribute('alt'),
      htmlElement.getAttribute('title'),
    ].find((value) => value?.trim());

    if (name) return [];
    return [{ tagName, type: input.type || undefined }];
  }));

  expect(unnamedControls).toEqual([]);

  const unlabeledFields = await page.locator(
    'input:visible:not([type="hidden"]), select:visible, textarea:visible',
  ).evaluateAll((elements) => elements.flatMap((element) => {
    const field = element as HTMLInputElement;
    const id = field.id;
    const hasExplicitLabel = Boolean(id && document.querySelector(`label[for="${CSS.escape(id)}"]`));
    const hasProgrammaticName = Boolean(
      field.getAttribute('aria-label') || field.getAttribute('aria-labelledby'),
    );
    return hasExplicitLabel || hasProgrammaticName ? [] : [{ tagName: field.tagName.toLowerCase(), id }];
  }));

  expect(unlabeledFields).toEqual([]);
}

async function assertSkipLink(page: Page, locale: Locale) {
  const skip = page.getByRole('link', { name: COPY[locale].skip, exact: true });
  const main = page.locator('main#main-content');

  await expect(skip).toBeAttached();
  await expect(skip).toHaveCount(1);
  const skipPrecedesHeader = await page.evaluate(() => {
    const skipElement = document.querySelector('.spa-skip-link');
    const headerElement = document.querySelector('header');
    return skipElement && headerElement
      ? Boolean(skipElement.compareDocumentPosition(headerElement) & Node.DOCUMENT_POSITION_FOLLOWING)
      : false;
  });
  expect(skipPrecedesHeader).toBe(true);

  await page.evaluate(() => {
    const body = document.body;
    body.setAttribute('tabindex', '-1');
    body.focus();
  });
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect.poll(async () => (await skip.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);

  await skip.press('Enter');
  await expect(main).toBeFocused();
}

async function assertLocalizedFloatingControls(page: Page, locale: Locale) {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
    window.dispatchEvent(new Event('scroll'));
  });
  await page.mouse.wheel(0, 2000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);

  await expect(page.getByTestId('back-to-top')).toBeVisible();
  await expect(page.getByTestId('back-to-top')).toHaveAttribute('aria-label', COPY[locale].backToTop);
  await expect(page.getByTestId('floating-quick-actions')).toBeVisible();
  await expect(page.getByTestId('floating-quick-actions')).toHaveAttribute('aria-label', COPY[locale].quickAccess);
}

async function assertRouteSpecificLabels(page: Page, locale: Locale, route: string, viewportWidth: number) {
  const copy = COPY[locale];

  if (route === '') {
    await expect(page.locator('[data-onboarding="search"] input')).toHaveAttribute('aria-label', copy.heroSearch);
    return;
  }

  if (route === '/all-tools') {
    await expect(page.getByRole('textbox', { name: copy.allToolsSearch, exact: true })).toHaveCount(1);
    return;
  }

  await expect(page.getByRole('textbox', { name: copy.favoritesSearch, exact: true })).toHaveCount(1);
  await page.getByRole('textbox', { name: copy.favoritesSearch, exact: true }).fill('json');
  await expect(page.getByRole('button', { name: copy.clearFavoritesSearch, exact: true })).toBeVisible();
  await expect(page.getByTestId('favorites-sort-view-controls').getByRole('button', { name: copy.viewGrid, exact: true })).toBeVisible();
  await page.getByTestId('favorites-sort-view-controls').getByRole('button', { name: copy.viewList, exact: true }).click();
  await expect(page.getByRole('button', { name: copy.removeFavorite, exact: true })).toBeVisible();

  if (viewportWidth === 320) {
    const buttonTops = await page.getByTestId('favorites-sort-view-controls').getByRole('button').evaluateAll((buttons) =>
      [...new Set(buttons.map((button) => Math.round(button.getBoundingClientRect().top)))],
    );
    expect(buttonTops.length).toBeGreaterThan(1);
  }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.setItem('quickshed-favorites', JSON.stringify(['json-formatter']));
  });
});

for (const locale of ['en', 'ar'] as const) {
  test.describe(`${locale} dual-shell accessibility contract`, () => {
    test('SPA shell preserves localized keyboard, landmark, and control-name contracts at 320px and desktop', async ({ page }) => {
      const routes = ['', '/all-tools', '/favorites'];

      for (const viewport of VIEWPORTS) {
        for (const route of routes) {
          await page.setViewportSize(viewport);
          await page.goto(`/${locale}${route}`);
          await expect(page.getByRole('main')).toBeVisible();
          await assertShellContract(page, locale);
          await assertRouteSpecificLabels(page, locale, route, viewport.width);
          await assertSkipLink(page, locale);
        }
      }

      await page.goto(`/${locale}`);
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await assertLocalizedFloatingControls(page, locale);
    });

    test('static shell preserves localized keyboard and landmark contracts across legal and blog pages', async ({ page }) => {
      const routes = ['/privacy', '/terms', '/blog'];

      for (const viewport of VIEWPORTS) {
        for (const route of routes) {
          await page.setViewportSize(viewport);
          await page.goto(`/${locale}${route}`);
          await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
          await assertShellContract(page, locale);
          await assertSkipLink(page, locale);
        }
      }
    });

    test('preserves the same contract in light and dark themes', async ({ page }) => {
      for (const theme of ['light', 'dark'] as const) {
        await page.goto(`/${locale}`);
        await page.evaluate((selectedTheme) => {
          localStorage.setItem('theme', selectedTheme);
        }, theme);
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
        await assertShellContract(page, locale);
      }
    });

    test('keeps the static shell contract in both themes', async ({ page }) => {
      for (const theme of ['light', 'dark'] as const) {
        await page.goto(`/${locale}/privacy`);
        await page.evaluate((selectedTheme) => {
          localStorage.setItem('theme', selectedTheme);
        }, theme);
        await page.reload({ waitUntil: 'networkidle' });
        await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
        await assertShellContract(page, locale);
      }
    });
  });
}
