import { expect, test, type Page } from '@playwright/test';

type TestWindow = Window & {
  __copiedText?: string;
  __xss?: boolean;
};

async function dismissOnboarding(page: Page) {
  await page.getByRole('button', { name: /dismiss/i }).click({ timeout: 1000 }).catch(() => undefined);
  await page.getByRole('button', { name: /skip/i }).click({ timeout: 5000 }).catch(() => undefined);
}

test.describe('QuickShed smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
    });
  });

  test('renders English home page without framework errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/en');

    await expect(page).toHaveTitle(/QuickShed/);
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();
    await expect(page.getByRole('main').getByText(/90\+ free tools/i)).toBeVisible();
    await expect(page.getByText(/Unhandled Runtime Error|Build Error|Next\.js/i)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('renders Arabic home page as RTL', async ({ page }) => {
    await page.goto('/ar');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: /صندوق أدواتك الفوري والآمن/i })).toBeVisible();
  });

  test('opens a canonical tool URL', async ({ page }) => {
    await page.goto('/en/tools/json-formatter');

    await expect(page).toHaveURL(/\/en\/tools\/json-formatter$/);
    await expect(page.getByRole('main').getByText(/JSON Formatter/i).first()).toBeVisible();
  });

  test('does not serve release archives from the app', async ({ request }) => {
    for (const path of [
      '/quickshed-complete.zip',
      '/quickshed-complete.tar.gz',
      '/quickshed-v1.0.0.zip',
      '/quickshed-v1.0.0.tar.gz',
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
      expect(response.headers()['content-type'] ?? '', path).not.toMatch(/application\/(zip|gzip)/i);
    }
  });

  test('copies canonical tool share URLs', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as TestWindow).__copiedText = text;
          },
        },
      });
    });

    await page.goto('/en/tools/json-formatter');
    await dismissOnboarding(page);
    await page.getByRole('button', { name: /copy link/i }).click();

    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__copiedText)
    ).toBe('http://127.0.0.1:7125/en/tools/json-formatter');
  });

  test('does not render Markdown input as executable HTML', async ({ page }) => {
    await page.addInitScript(() => {
      (window as TestWindow).__xss = false;
    });

    await page.goto('/en/tools/markdown-to-html');
    await dismissOnboarding(page);
    await page.getByPlaceholder(/type your markdown here/i).fill([
      '<img data-xss="markdown" src=x onerror="window.__xss=true">',
      '[bad](javascript:alert(1))',
      '![bad](javascript:alert(1))',
    ].join('\n'));

    await expect(page.locator('img[data-xss="markdown"]')).toHaveCount(0);
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(page.locator('img[src^="javascript:"]')).toHaveCount(0);
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__xss)
    ).toBe(false);
  });

  test('does not render JSON strings as executable HTML in raw view', async ({ page }) => {
    await page.addInitScript(() => {
      (window as TestWindow).__xss = false;
    });

    await page.goto('/en/tools/json-formatter');
    await dismissOnboarding(page);
    await page.getByPlaceholder(/paste your json here/i).fill(
      JSON.stringify({
        payload: '<img data-xss="json" src=x onerror="window.__xss=true">',
      })
    );
    await page.getByRole('button', { name: /format \/ prettify/i }).click();

    const output = page.locator('pre.tool-output');
    await expect(page.locator('img[data-xss="json"]')).toHaveCount(0);
    await expect(output).toContainText('data-xss=\\"json\\"');
    await expect(output).toContainText('<img');
    await expect.poll(
      () => output.evaluate((node) => node.innerHTML.includes('<img'))
    ).toBe(false);
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__xss)
    ).toBe(false);
  });

  test('opens command palette with Ctrl+K', async ({ page }) => {
    await page.goto('/en');
    await dismissOnboarding(page);

    await page.keyboard.press('Control+K');

    await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
  });

  test('renders the home page on a mobile viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile viewport coverage runs in the mobile-chromium project');

    await page.goto('/en');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();
    await expect(page.getByRole('main').getByText(/90\+ free tools/i)).toBeVisible();
  });

  test('keeps navigation safe when service workers are unavailable', async ({ page, context }) => {
    await context.route('**/sw.js', (route) => route.fulfill({ status: 404, body: '' }));

    await page.goto('/en/tools/json-formatter');

    await expect(page).toHaveURL(/\/en\/tools\/json-formatter$/);
    await expect(page.getByRole('main').getByText(/JSON Formatter/i).first()).toBeVisible();
  });
});
