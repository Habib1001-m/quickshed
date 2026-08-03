import { expect, test, type Page } from '@playwright/test';

const WELCOME_KEY = 'quickshed-welcomed';
const TOUR_KEY = 'quickshed-onboarding-complete';
const START_EVENT = 'quickshed-start-onboarding';

function seedOnboarding(page: Page) {
  return page.addInitScript(() => {
    localStorage.removeItem('quickshed-welcomed');
    localStorage.removeItem('quickshed-onboarding-complete');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
}

test.describe('F6 onboarding Welcome gate', () => {
  test('fresh English visits show Welcome before Guided Tour, then start step 1', async ({ page }) => {
    await seedOnboarding(page);
    await page.goto('/en');

    const welcomeHeading = page.getByRole('heading', { name: 'Privacy First, Always', exact: true });
    const tourStep = page.getByText('Step 1 of 5', { exact: true });

    await expect(welcomeHeading).toBeVisible();
    await expect.poll(() => tourStep.isVisible()).toBe(false);

    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), WELCOME_KEY)).toBe('true');
    await expect(tourStep).toBeVisible();
  });

  test('an incomplete Welcome gate blocks restart until Welcome is skipped', async ({ page }) => {
    await seedOnboarding(page);
    await page.addInitScript((tourKey) => {
      localStorage.setItem(tourKey, 'true');
    }, TOUR_KEY);
    await page.goto('/en');

    const welcomeHeading = page.getByRole('heading', { name: 'Privacy First, Always', exact: true });
    const tourStep = page.getByText('Step 1 of 5', { exact: true });

    await expect(welcomeHeading).toBeVisible();
    await page.evaluate((eventName) => {
      window.dispatchEvent(new CustomEvent(eventName));
    }, START_EVENT);

    await expect(welcomeHeading).toBeVisible();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), WELCOME_KEY)).toBeNull();
    await expect.poll(() => tourStep.isVisible()).toBe(false);

    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await expect(tourStep).toBeVisible();
  });

  test('a canonical Welcome flag allows direct restart at Guided Tour step 1', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
    });
    await page.goto('/en');

    const welcomeHeading = page.getByRole('heading', { name: 'Privacy First, Always', exact: true });
    const tourStep = page.getByText('Step 1 of 5', { exact: true });

    await expect.poll(() => welcomeHeading.isVisible()).toBe(false);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Restart Tour', exact: true }).click();

    await expect(tourStep).toBeVisible();
    await expect.poll(() => welcomeHeading.isVisible()).toBe(false);
  });

  test('a restart requested before the tour mounts is consumed when Home mounts it', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
    });
    await page.goto('/en/tools/json-formatter');

    await expect(page.getByRole('heading', { name: 'JSON Formatter', exact: true })).toBeVisible();
    await page.locator('header').getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Restart Tour', exact: true }).click();
    await page.locator('header').getByRole('button', { name: 'Home', exact: true }).click();

    await expect(page.getByText('Step 1 of 5', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Privacy First, Always', exact: true })).toBeHidden();
  });

  test('Welcome stays visible and the tour stays gated when persistence fails', async ({ page }) => {
    await seedOnboarding(page);
    await page.goto('/en');

    const welcomeHeading = page.getByRole('heading', { name: 'Privacy First, Always', exact: true });
    const tourStep = page.getByText('Step 1 of 5', { exact: true });

    await expect(welcomeHeading).toBeVisible();
    await expect.poll(() => tourStep.isVisible()).toBe(false);
    await page.evaluate(() => {
      const setItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'quickshed-welcomed') throw new Error('Welcome storage blocked');
        return setItem.call(this, key, value);
      };
    });
    await page.getByRole('button', { name: 'Skip', exact: true }).click();

    await expect(welcomeHeading).toBeVisible();
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), WELCOME_KEY)).toBeNull();
    await expect.poll(() => tourStep.isVisible()).toBe(false);
  });

  test('fresh Arabic visits preserve RTL and start the Arabic tour after Welcome', async ({ page }) => {
    await seedOnboarding(page);
    await page.goto('/ar');

    const welcomeHeading = page.getByRole('heading', { name: 'الخصوصية أولاً، دائماً', exact: true });
    const tourStep = page.getByText('الخطوة 1 من 5', { exact: true });

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(welcomeHeading).toBeVisible();
    await expect.poll(() => tourStep.isVisible()).toBe(false);

    await page.getByRole('button', { name: 'تخطي', exact: true }).click();
    await expect(tourStep).toBeVisible();
  });
});
