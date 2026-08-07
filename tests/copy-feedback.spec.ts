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

test('clears URL copy success when the next copy attempt fails', async ({ page }) => {
  await page.goto('/en/tools/url-shortener');
  await continuePastToolDisclosure(page);

  await page.getByPlaceholder(/https:\/\/example\.com\/very\/long\/url/).fill(
    'https://example.com/copy-feedback'
  );
  await page.getByPlaceholder('my-link').fill('copy-feedback');
  await page.getByRole('button', { name: /^shorten$/i }).click();

  const copyButton = page.getByRole('button', { name: /^copy$/i });
  await copyButton.click();
  await expect(copyButton.locator('svg.text-emerald-500')).toHaveCount(1);

  await page.evaluate(() => {
    (window as TestWindow).__clipboardShouldFail = true;
  });
  await copyButton.click();

  await expect(page.getByText('Could not copy to clipboard', { exact: true })).toBeVisible();
  await expect(copyButton.locator('svg.text-emerald-500')).toHaveCount(0);
});
