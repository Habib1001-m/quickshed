import { expect, test, type Page } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

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
    await expect(page.getByRole('main').getByText(/90 free tools/i)).toBeVisible();
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
    await continuePastToolDisclosure(page);
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
    await continuePastToolDisclosure(page);
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
    await continuePastToolDisclosure(page);
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
    await expect(page.getByRole('main').getByText(/90 free tools/i)).toBeVisible();
  });

  test('keeps navigation safe when service workers are unavailable', async ({ page, context }) => {
    await context.route('**/sw.js', (route) => route.fulfill({ status: 404, body: '' }));

    await page.goto('/en/tools/json-formatter');

    await expect(page).toHaveURL(/\/en\/tools\/json-formatter$/);
    await expect(page.getByRole('main').getByText(/JSON Formatter/i).first()).toBeVisible();
  });

  test('shortens to a same-browser hash route under the localized tool path', async ({ page }) => {
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

    await page.goto('/en/tools/url-shortener');
    await dismissOnboarding(page);
    await continuePastToolDisclosure(page);

    await page
      .getByPlaceholder(/https:\/\/example\.com\/very\/long\/url/)
      .fill('http://127.0.0.1:7125/en?short-target=1');
    await page.getByPlaceholder('my-link').fill('mytest');
    await page.getByRole('button', { name: /^shorten$/i }).click();

    await expect(
      page.getByText(/\/en\/tools\/url-shortener#s\/mytest/).first()
    ).toBeVisible();

    await page.getByRole('button', { name: /^copy$/i }).click();
    await expect.poll(() =>
      page.evaluate(() => (window as TestWindow).__copiedText)
    ).toBe('http://127.0.0.1:7125/en/tools/url-shortener#s/mytest');
  });

  test('resolves a same-browser short link to an explicit CTA without auto-navigating', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'quickshed-url-shortener',
        JSON.stringify([
          {
            alias: 'demo',
            original: 'http://127.0.0.1:7125/en?short-target=1',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('/en/tools/url-shortener#s/demo');
    await continuePastToolDisclosure(page);

    // The hash resolves to an explicit user-action CTA (rendered above the
    // stored-links list, hence .first()) instead of auto-navigating.
    const cta = page.getByRole('link', { name: /open original url/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /short-target=1/);
    await expect(cta).toHaveAttribute('rel', /noopener/);
    await expect(cta).toHaveAttribute('rel', /noreferrer/);

    // No automatic external navigation occurred.
    await expect(page).toHaveURL(/\/en\/tools\/url-shortener/);
    await expect(page).not.toHaveURL(/short-target=1/);

    // The explicit CTA opens the stored target.
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      cta.click(),
    ]);
    await expect(popup).toHaveURL(/short-target=1/);
  });

  test('does not navigate from an unsafe stored short link', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'quickshed-url-shortener',
        JSON.stringify([
          {
            alias: 'demo',
            original: 'javascript:alert(1)',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('/en/tools/url-shortener#s/demo');
    await continuePastToolDisclosure(page);

    await expect(page).toHaveURL(/\/en\/tools\/url-shortener/);
    await expect(
      page.getByText(/Short link not found or unavailable in this browser/i)
    ).toBeVisible();
  });
});
