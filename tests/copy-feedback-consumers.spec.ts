import { expect, test } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

type TestWindow = Window & {
  __clipboardShouldFail?: boolean;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');

    (window as TestWindow).__clipboardShouldFail = false;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          if ((window as TestWindow).__clipboardShouldFail) {
            throw new Error('clipboard denied');
          }
        },
      },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: (command: string) =>
        command !== 'copy' || !(window as TestWindow).__clipboardShouldFail,
    });
  });
});

test('clears ShareTool success when the next copy attempt fails', async ({ page }) => {
  await page.goto('/en/tools/color-picker');
  await continuePastToolDisclosure(page);

  await page.getByRole('button', { name: /^share tool$/i }).click();
  const sharePopover = page.locator('[data-slot="popover-content"]');
  const copyLink = sharePopover.getByRole('button', { name: /^(copy link|copied!)$/i });

  await copyLink.click();
  await expect(sharePopover.getByRole('button', { name: /^copied!$/i })).toBeVisible();

  await page.evaluate(() => {
    (window as TestWindow).__clipboardShouldFail = true;
  });
  await copyLink.click();

  await expect(sharePopover.getByRole('button', { name: /^copy link$/i })).toBeVisible();
  await expect(page.getByText('Copied!', { exact: true })).toHaveCount(0);
});
