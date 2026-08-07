import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

test('moves focus between tool actions with ArrowRight', async ({ page }) => {
  await page.goto('/en/all-tools');

  const cards = page.locator('[data-tool-card]');
  const secondAction = cards.nth(1).locator('[data-tool-card-action]');
  const thirdAction = cards.nth(2).locator('[data-tool-card-action]');
  const firstCard = cards.first();

  await expect(secondAction).toBeVisible();
  await expect(thirdAction).toBeVisible();
  await expect(firstCard.locator('[data-tool-card-action] button')).toHaveCount(0);
  await expect(firstCard.locator('[data-onboarding="favorites"]')).toHaveCount(1);

  // Simulate arriving at the second card through the normal Tab focus order.
  await secondAction.focus();
  await expect(secondAction).toBeFocused();
  await page.keyboard.press('ArrowRight');

  await expect(thirdAction).toBeFocused();
});
