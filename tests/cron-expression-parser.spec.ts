import { expect, test } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

test('parses six-field Cron expressions with seconds first', async ({ page }) => {
  await page.goto('/en/tools/cron-expression-parser');
  await continuePastToolDisclosure(page);

  const cronInput = page.locator('.tool-wrapper-card input').first();
  await cronInput.fill('7 30 14 * * *');

  await expect(page.getByText('Seconds (optional)', { exact: true })).toBeVisible();
  await expect(page.locator('.tool-wrapper-card code')).toHaveText(['7', '30', '14', '*', '*', '*']);
  await expect(page.locator('p.text-sm.font-medium').filter({ hasText: '14:30:07' })).toHaveCount(1);

  const executionTimes = page.locator('span.text-sm.font-mono');
  await expect(executionTimes).toHaveCount(5);
  await expect(executionTimes.first()).toContainText(':30:07');
});

test('preserves seconds when editing a six-field expression in the builder', async ({ page }) => {
  await page.goto('/en/tools/cron-expression-parser');
  await continuePastToolDisclosure(page);

  const cronInput = page.locator('.tool-wrapper-card input').first();
  const builderInput = (label: string) => page.locator('label').filter({ hasText: label }).locator('..').locator('input');

  await cronInput.fill('7 30 14 * * *');

  const secondsInput = builderInput('Second (0-59)');
  const minuteInput = builderInput('Minute (0-59)');
  await expect(secondsInput).toHaveValue('7');
  await expect(minuteInput).toHaveValue('30');

  await minuteInput.fill('31');

  await expect(cronInput).toHaveValue('7 31 14 * * *');
  await expect(secondsInput).toHaveValue('7');
});

test('keeps five-field expressions when editing the builder', async ({ page }) => {
  await page.goto('/en/tools/cron-expression-parser');
  await continuePastToolDisclosure(page);

  const cronInput = page.locator('.tool-wrapper-card input').first();
  const minuteInput = page.locator('label').filter({ hasText: 'Minute (0-59)' }).locator('..').locator('input');

  await cronInput.fill('30 14 * * *');
  await minuteInput.fill('31');

  await expect(cronInput).toHaveValue('31 14 * * *');
  await expect(page.locator('.tool-wrapper-card code')).toHaveText(['31', '14', '*', '*', '*']);
});
