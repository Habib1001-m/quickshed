import { expect, test, type Locator, type Page } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

const RATING_STORAGE_KEY = 'quickshed-tool-ratings';

async function openTool(page: Page, route: string, groupName: string): Promise<Locator> {
  await page.goto(route);
  await continuePastToolDisclosure(page);

  const group = page.getByRole('group', { name: groupName, exact: true });
  await expect(group).toBeVisible();
  return group;
}

function starButton(group: Locator, name: string): Locator {
  return group.getByRole('button', { name, exact: true });
}

async function storedRating(page: Page, toolId: string): Promise<number | null> {
  return page.evaluate(
    ({ key, id }) => {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Record<string, { rating?: unknown }>;
      const rating = parsed[id]?.rating;
      return typeof rating === 'number' ? rating : null;
    },
    { key: RATING_STORAGE_KEY, id: toolId },
  );
}

test.describe('local tool ratings', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
      if (sessionStorage.getItem('tool-rating-test-reset') !== 'true') {
        localStorage.removeItem('quickshed-tool-ratings');
        sessionStorage.setItem('tool-rating-test-reset', 'true');
      }
    });
  });

  test('selecting the same star again removes the local rating', async ({ page }) => {
    const group = await openTool(page, '/en/tools/json-formatter', 'Rating on this device');
    const fourStars = starButton(group, 'Rate 4 stars on this device');

    await expect(group).toContainText('Rating on this device');
    await expect(fourStars).toHaveAttribute('aria-pressed', 'false');

    await fourStars.click();
    await expect(fourStars).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => storedRating(page, 'json-formatter')).toBe(4);

    await fourStars.click();
    await expect(fourStars).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), RATING_STORAGE_KEY)).toBeNull();
  });

  test('restores the selected local rating after a reload', async ({ page }) => {
    const group = await openTool(page, '/en/tools/json-formatter', 'Rating on this device');
    const fiveStars = starButton(group, 'Rate 5 stars on this device');

    await fiveStars.click();
    await expect.poll(() => storedRating(page, 'json-formatter')).toBe(5);

    await page.reload();
    await continuePastToolDisclosure(page);

    const reloadedGroup = page.getByRole('group', { name: 'Rating on this device', exact: true });
    await expect(reloadedGroup).toBeVisible();
    await expect(starButton(reloadedGroup, 'Rate 5 stars on this device')).toHaveAttribute('aria-pressed', 'true');
    await expect(starButton(reloadedGroup, 'Rate 4 stars on this device')).toHaveAttribute('aria-pressed', 'false');
  });

  test('reinitializes the rating when SPA navigation switches tools', async ({ page }) => {
    const firstGroup = await openTool(page, '/en/tools/json-formatter', 'Rating on this device');
    await starButton(firstGroup, 'Rate 3 stars on this device').click();
    await expect.poll(() => storedRating(page, 'json-formatter')).toBe(3);

    await page.getByRole('button', { name: 'Home', exact: true }).first().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

    await page
      .locator('[data-onboarding="categories"]')
      .getByRole('button', { name: 'View All Tools', exact: true })
      .click();
    await expect(page).toHaveURL(/\/en\/all-tools$/);

    await page.getByRole('textbox', { name: 'Search across all tools...', exact: true }).fill('text reverser');
    const secondTool = page.getByRole('button', { name: 'Text Reverser', exact: true });
    await expect(secondTool).toBeVisible();
    await secondTool.click();
    await expect(page).toHaveURL(/\/en\/tools\/text-reverser$/);
    await continuePastToolDisclosure(page);

    const secondGroup = page.getByRole('group', { name: 'Rating on this device', exact: true });
    await expect(secondGroup).toBeVisible();
    await expect(starButton(secondGroup, 'Rate 3 stars on this device')).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => storedRating(page, 'json-formatter')).toBe(3);
    await expect.poll(() => storedRating(page, 'text-reverser')).toBeNull();
  });

  test('keeps rating copy and controls bilingual in Arabic', async ({ page }) => {
    const group = await openTool(page, '/ar/tools/json-formatter', 'التقييم على هذا الجهاز');
    const fourStars = starButton(group, 'قيّم بـ 4 نجوم على هذا الجهاز');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(fourStars).toHaveAttribute('aria-pressed', 'false');
    await fourStars.click();
    await expect(fourStars).toHaveAttribute('aria-pressed', 'true');
  });

  test('labels the all-tools sort as local to this device', async ({ page }) => {
    await page.goto('/en/all-tools');
    await expect(page.getByRole('button', { name: 'By your rating on this device', exact: true })).toBeVisible();

    await page.goto('/ar/all-tools');
    await expect(page.getByRole('button', { name: 'حسب تقييمك على هذا الجهاز', exact: true })).toBeVisible();
  });
});
