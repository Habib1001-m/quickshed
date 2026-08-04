import { expect, test } from '@playwright/test';

/**
 * F3 — SPA navigation accessibility.
 *
 * Focused, deterministic coverage for the skip link, post-route focus
 * management, and the polite localized live announcements added in
 * `RoutePageShell`. No fixed sleeps are used: every wait relies on
 * `expect`/`expect.poll` against real state changes.
 */

type TestWindow = Window & {
  __spaLoadToken?: number;
};

// Reuse the same onboarding/localStorage suppression the smoke suite uses so
// the Welcome overlay and Guided Tour never intercept focus or Tab order.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

test.describe('SPA navigation accessibility (F3)', () => {
  test('skip link is keyboard-reachable before the header, reveals on focus, and jumps to main content', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

    const skip = page.getByRole('link', { name: /skip to main content/i });

    // It is the first element of the interactive shell, before the header.
    const order = await page.evaluate(() => {
      const link = document.querySelector('.spa-skip-link');
      const header = document.querySelector('header');
      if (!link || !header) return 'missing';
      return (link.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
        ? 'skip-before-header'
        : 'skip-not-before-header';
    });
    expect(order).toBe('skip-before-header');

    // Visually hidden (off-screen) until focused.
    const hiddenBox = await skip.boundingBox();
    expect(hiddenBox).not.toBeNull();
    expect(hiddenBox!.y).toBeLessThan(0);

    // Keyboard-discoverable: the first Tab stop lands on the skip link, which
    // reveals it on-screen.
    await page.keyboard.press('Tab');
    await expect(skip).toBeFocused();
    await expect.poll(async () => (await skip.boundingBox())!.y).toBeGreaterThanOrEqual(0);

    // Activating it moves focus to the stable main target.
    await skip.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('pushState navigation from Home to All Tools updates the URL, focuses the route target, and announces', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

    const announcer = page.getByTestId('route-announcer');

    // Initial route must not have announced (no focus theft / no message).
    await expect(announcer).toHaveText('');

    // Trigger the existing SPA control that calls navigateToAllTools().
    await page.getByRole('button', { name: /view all tools/i }).first().click();

    await expect(page).toHaveURL(/\/en\/all-tools$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(announcer).toContainText('Navigated to All Tools');
  });

  test('browser back/forward updates focus and the announcement without a full page reload', async ({ page }) => {
    // A per-document token: addInitScript re-runs on every full navigation, so
    // a reload would change the value. Stable value == pure SPA popstate.
    await page.addInitScript(() => {
      (window as TestWindow).__spaLoadToken = Math.random();
    });

    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();
    const initialToken = await page.evaluate(() => (window as TestWindow).__spaLoadToken);

    const announcer = page.getByTestId('route-announcer');

    // Push a SPA entry: Home -> Favorites via the always-visible header button.
    await page.getByRole('button', { name: /^favorites$/i }).first().click();
    await expect(page).toHaveURL(/\/en\/favorites$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(announcer).toContainText('Navigated to Favorites');

    // Back to Home via popstate (no reload).
    await page.goBack();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(announcer).toContainText('Navigated to Home');

    // Forward back to Favorites via popstate (no reload).
    await page.goForward();
    await expect(page).toHaveURL(/\/en\/favorites$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(announcer).toContainText('Navigated to Favorites');

    const finalToken = await page.evaluate(() => (window as TestWindow).__spaLoadToken);
    expect(finalToken).toBe(initialToken);
  });

  test('Arabic navigation keeps RTL and exposes Arabic skip + announcement text', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    const skip = page.getByRole('link', { name: /تخطّي إلى المحتوى الرئيسي/ });
    await expect(skip).toBeAttached();

    // Initial route must not announce.
    const announcer = page.getByTestId('route-announcer');
    await expect(announcer).toHaveText('');

    await page.getByRole('button', { name: /عرض جميع الأدوات/ }).first().click();

    await expect(page).toHaveURL(/\/ar\/all-tools$/);
    await expect(page.locator('#main-content')).toBeFocused();
    await expect(announcer).toContainText('تم الانتقال إلى جميع الأدوات');
  });

  test('initial page load does not move focus to the main target', async ({ page }) => {
    await page.goto('/en');
    // Wait for hydration + initial route to settle (home hero rendered).
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

    await expect(page.locator('#main-content')).not.toBeFocused();
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('BODY');

    // And nothing was announced for the initial route.
    await expect(page.getByTestId('route-announcer')).toHaveText('');
  });
});
