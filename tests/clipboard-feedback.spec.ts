import { expect, test, type Page } from '@playwright/test';

type ClipboardTestWindow = Window & {
  __clipboardMode?: 'pending' | 'reject' | 'resolve';
  __fallbackCopyResult?: boolean;
  __clipboardAttempts?: number;
  __clipboardRejected?: boolean;
  __fallbackAttempts?: number;
};

async function prepareClipboardPage(page: Page, initialMode: ClipboardTestWindow['__clipboardMode']) {
  await page.addInitScript((mode: ClipboardTestWindow['__clipboardMode']) => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    const testWindow = window as ClipboardTestWindow;
    testWindow.__clipboardMode = mode;
    testWindow.__fallbackCopyResult = false;
    testWindow.__clipboardAttempts = 0;
    testWindow.__clipboardRejected = false;
    testWindow.__fallbackAttempts = 0;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: () => {
          testWindow.__clipboardAttempts = (testWindow.__clipboardAttempts ?? 0) + 1;
          if (testWindow.__clipboardMode === 'pending') {
            return new Promise(() => undefined);
          }
          if (testWindow.__clipboardMode === 'reject') {
            const rejection = new Promise((_, reject) => {
              setTimeout(() => {
                testWindow.__clipboardRejected = true;
                reject(new Error('clipboard rejected'));
              }, 500);
            });
            rejection.catch(() => undefined);
            return rejection;
          }
          return Promise.resolve();
        },
      },
    });

    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: () => {
        testWindow.__fallbackAttempts = (testWindow.__fallbackAttempts ?? 0) + 1;
        return testWindow.__fallbackCopyResult ?? false;
      },
    });
  }, initialMode);

  await page.goto('/en/tools/json-formatter');
  await page.getByPlaceholder(/paste your json here/i).fill('{"copy":true}');
  await page.getByRole('button', { name: /format \/ prettify/i }).click();
}

async function rejectClipboard(page: Page) {
  await page.evaluate(() => {
    (window as ClipboardTestWindow).__clipboardMode = 'reject';
  });
}

async function enableClipboardSuccess(page: Page) {
  await page.evaluate(() => {
    (window as ClipboardTestWindow).__clipboardMode = 'resolve';
  });
}

async function enableFallbackSuccess(page: Page) {
  await page.evaluate(() => {
    (window as ClipboardTestWindow).__fallbackCopyResult = true;
  });
}

test.describe('copy feedback truth', () => {
  test('does not show success after direct clipboard rejection and preserves success UX', async ({ page }) => {
    await prepareClipboardPage(page, 'pending');

    const copyButton = page.getByRole('button', { name: 'Copy', exact: true }).first();
    await copyButton.click();
    await expect.poll(() => page.evaluate(() => (window as ClipboardTestWindow).__clipboardAttempts)).toBe(1);
    await page.waitForTimeout(300);
    expect(await page.getByRole('button', { name: 'Copied!', exact: true }).count()).toBe(0);
    await rejectClipboard(page);
    await copyButton.click();
    await expect.poll(() => page.evaluate(() => (window as ClipboardTestWindow).__clipboardAttempts)).toBe(2);
    await expect.poll(() => page.evaluate(() => (window as ClipboardTestWindow).__clipboardRejected)).toBe(true);
    await page.waitForTimeout(100);
    expect(await page.getByRole('button', { name: 'Copied!', exact: true }).count()).toBe(0);

    await enableClipboardSuccess(page);
    await copyButton.click();
    await expect(page.getByRole('button', { name: 'Copied!', exact: true }).first()).toBeVisible();
  });

  test('does not show success when the primary write rejects and fallback returns false', async ({ page }) => {
    await prepareClipboardPage(page, 'reject');

    const copyLinkButton = page.locator('.quick-actions-glass > button').first();
    await copyLinkButton.click();
    await expect.poll(() => page.evaluate(() => (window as ClipboardTestWindow).__fallbackAttempts)).toBe(1);
    await page.waitForTimeout(100);
    expect(await page.getByRole('button', { name: /copied/i }).count()).toBe(0);

    await enableFallbackSuccess(page);
    await copyLinkButton.click();
    await expect.poll(() => page.evaluate(() => (window as ClipboardTestWindow).__fallbackAttempts)).toBe(2);
    await expect(page.getByRole('button', { name: /copied/i })).toBeVisible();
  });
});
